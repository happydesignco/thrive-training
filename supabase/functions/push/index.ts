// Web push for the group schedule.
//   { action: "key" }     → { key }  VAPID public key for pushManager.subscribe
//   { action: "notify", publisher_id, week_start, days: [{ day, updated }] }
//                         → tells everyone following that publisher that a
//                           workout was posted. Only for the current week;
//                           edits only notify for today or tomorrow.
// VAPID keys are generated on first use and kept in push_config (service role
// only), so there's no secret to manage.
import { createClient } from "npm:@supabase/supabase-js@2";
import * as webpush from "jsr:@negrel/webpush@0.5.0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const TZ = "America/Chicago";
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_NAMES: Record<string, string> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
  friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Stored VAPID keys (JWK), created on first use.
async function getExportedVapidKeys(): Promise<webpush.ExportedVapidKeys> {
  const { data } = await admin.from("push_config").select("vapid").eq("id", 1).maybeSingle();
  if (data?.vapid) return data.vapid;

  const exported = await webpush.exportVapidKeys(await webpush.generateVapidKeys({ extractable: true }));
  await admin.from("push_config").upsert({ id: 1, vapid: exported }, { onConflict: "id", ignoreDuplicates: true });
  // Re-read in case another request created keys first.
  const { data: saved } = await admin.from("push_config").select("vapid").eq("id", 1).single();
  return saved!.vapid;
}

// Today in Chicago as { date: YYYY-MM-DD, dayIdx: 0=Mon..6=Sun, weekStart }
function chicagoToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)!.value;
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const dayIdx = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(get("weekday"));
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dayIdx);
  return { date, dayIdx, weekStart: d.toISOString().slice(0, 10) };
}

function summarize(session: { blocks?: { items?: { text: string }[] }[] } | undefined) {
  const lines = (session?.blocks || []).flatMap(b => b.items || []).map(i => i.text);
  return lines.slice(0, 3).join(" · ") + (lines.length > 3 ? " …" : "");
}

async function notify(callerId: string, body: {
  publisher_id: string; week_start: string; days: { day: string; updated?: boolean }[];
}) {
  const { publisher_id, week_start } = body;
  if (!publisher_id || !week_start || !Array.isArray(body.days)) return json({ error: "Bad request" }, 400);

  // Caller must be the publisher or one of their editors.
  if (callerId !== publisher_id) {
    const { data: ed } = await admin.from("schedule_editors").select("editor_id")
      .eq("publisher_id", publisher_id).eq("editor_id", callerId).maybeSingle();
    if (!ed) return json({ error: "Not allowed" }, 403);
  }

  const today = chicagoToday();
  if (week_start !== today.weekStart) return json({ sent: 0, skipped: "not this week" });

  const days = body.days
    .filter(d => DAYS.includes(d.day))
    .filter(d => !d.updated || [today.dayIdx, today.dayIdx + 1].includes(DAYS.indexOf(d.day)));
  if (!days.length) return json({ sent: 0, skipped: "nothing to announce" });

  const { data: week } = await admin.from("user_data").select("value")
    .eq("user_id", publisher_id).eq("key", `week:${week_start}`).maybeSingle();
  const posted = days.filter(d => week?.value?.[d.day]?.session);
  if (!posted.length) return json({ sent: 0, skipped: "no workout found" });

  let title: string, text: string;
  if (posted.length === 1) {
    const d = posted[0];
    title = `${DAY_NAMES[d.day]}'s workout is ${d.updated ? "updated" : "up"}`;
    text = summarize(week!.value[d.day].session);
  } else {
    title = "New workouts posted";
    text = posted.map(d => DAY_NAMES[d.day]).join(", ");
  }

  // Recipients: people following this publisher. Anyone with no saved
  // schedule follows the oldest published schedule (see useUser.getSchedule).
  const { data: subs } = await admin.from("push_subscriptions").select("endpoint, user_id, keys");
  if (!subs?.length) return json({ sent: 0 });
  const userIds = [...new Set(subs.map(s => s.user_id))];
  const { data: scheds } = await admin.from("user_data").select("user_id, value")
    .eq("key", "schedule").in("user_id", userIds);
  const { data: oldest } = await admin.from("published_schedules").select("user_id")
    .order("created_at", { ascending: true }).limit(1).maybeSingle();
  const schedOf = new Map((scheds || []).map(s => [s.user_id, s.value]));
  const follows = (uid: string) => {
    const s = schedOf.get(uid);
    if (!s) return oldest?.user_id === publisher_id;
    return s.publisherUserId === publisher_id;
  };
  const targets = subs.filter(s => s.user_id !== callerId && follows(s.user_id));

  const server = await webpush.ApplicationServer.new({
    contactInformation: "https://app.thriveathletic.club",
    vapidKeys: await webpush.importVapidKeys(await getExportedVapidKeys()),
  });
  const payload = JSON.stringify({
    title, body: text, tag: `workout-${week_start}-${posted.map(d => d.day).join("-")}`, url: "/?tab=week",
  });

  let sent = 0;
  const gone: string[] = [];
  await Promise.all(targets.map(async s => {
    try {
      await server.subscribe({ endpoint: s.endpoint, keys: s.keys })
        .pushTextMessage(payload, { ttl: 60 * 60 * 12, urgency: webpush.Urgency.High });
      sent++;
    } catch (err) {
      if (err instanceof webpush.PushMessageError && [404, 410].includes(err.response.status)) {
        gone.push(s.endpoint);
      } else {
        console.warn("push failed", String(err));
      }
    }
  }));
  if (gone.length) await admin.from("push_subscriptions").delete().in("endpoint", gone);

  return json({ sent, removed: gone.length });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  // verify_jwt also accepts the public anon key, so require a real user.
  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Sign in first" }, 401);

  let body;
  try { body = await req.json(); } catch { return json({ error: "Bad request body" }, 400); }

  if (body.action === "key") {
    const keys = await webpush.importVapidKeys(await getExportedVapidKeys());
    return json({ key: await webpush.exportApplicationServerKey(keys) });
  }
  if (body.action === "notify") return await notify(user.id, body);
  return json({ error: "Unknown action" }, 400);
});
