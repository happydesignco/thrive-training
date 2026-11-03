// Reads a screenshot of a workout note and returns it as plain text in the
// app's note format, so the client-side parser (src/utils/session.js) can
// turn it into a session. Requires a signed-in user (verify_jwt) and the
// ANTHROPIC_API_KEY secret.
import Anthropic from "npm:@anthropic-ai/sdk";
import { z } from "npm:zod";
import { zodOutputFormat } from "npm:@anthropic-ai/sdk/helpers/zod";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const MAX_BASE64 = 7_000_000; // ~5 MB of image

const Workout = z.object({
  day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "none"]),
  text: z.string(),
});

const SYSTEM = `You transcribe screenshots of gym workout notes for a small training group's app.

Return the workout as plain text, one exercise or instruction per line, exactly as written. Keep the coach's wording, numbers, and abbreviations (e.g. "3x10", "531", "each leg", "X4", "amrap"). Don't add, explain, reorder, or invent anything, and don't fix spelling.

Keep the groupings: put one blank line between groups where the note has a gap (for example between paired lifts, before a finisher, or between "Block 1" and "Block 2").

If the note is titled with a day of the week, put that day in "day" and leave the title out of "text". Otherwise set "day" to "none". If the screenshot shows more than one day, put each day name on its own line before that day's workout inside "text" and set "day" to "none".`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // verify_jwt also accepts the public anon key, so require a real user.
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Sign in first" }, 401);

  let image: string, mediaType: string;
  try {
    ({ image, media_type: mediaType } = await req.json());
  } catch {
    return json({ error: "Bad request body" }, 400);
  }
  if (!image || typeof image !== "string") return json({ error: "No image" }, 400);
  if (!MEDIA_TYPES.includes(mediaType as typeof MEDIA_TYPES[number])) {
    return json({ error: "Unsupported image type" }, 400);
  }
  if (image.length > MAX_BASE64) return json({ error: "Image too large" }, 413);

  if (!Deno.env.get("ANTHROPIC_API_KEY")) return json({ error: "Image reading isn't set up yet" }, 503);
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(Workout) },
      system: SYSTEM,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as typeof MEDIA_TYPES[number],
              data: image,
            },
          },
          { type: "text", text: "Transcribe this workout." },
        ],
      }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return json({ error: "Couldn't read that image" }, 422);
    }
    return json(response.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: "Busy, try again in a minute" }, 429);
    if (err instanceof Anthropic.AuthenticationError) return json({ error: "Image reading isn't set up yet" }, 503);
    if (err instanceof Anthropic.APIError) return json({ error: "Image reading failed" }, 502);
    throw err;
  }
});
