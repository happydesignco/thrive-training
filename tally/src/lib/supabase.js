import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Don't throw — let the UI render a helpful error page instead of crashing main.jsx.
  console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set them in .env (or in Sevalla env vars).')
}

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'public-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
