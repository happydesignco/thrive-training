export default function MissingConfig() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="panel p-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-2">Supabase not configured</h1>
        <p className="opacity-80 mb-4">
          Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment
          (locally in <code>.env</code>, or in Sevalla's project env vars), then redeploy.
        </p>
        <p className="opacity-60 text-sm">See README → "Setup" for details.</p>
      </div>
    </div>
  )
}
