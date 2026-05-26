import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'

export default function Rules() {
  const { family, reload } = useFamily()
  const [form, setForm] = useState({
    name: family.name,
    weekly_token_allowance: family.weekly_token_allowance,
    screen_time_minutes_per_token: family.screen_time_minutes_per_token,
    reading_minutes_per_token: family.reading_minutes_per_token,
    cash_per_unspent_token_cents: family.cash_per_unspent_token_cents,
    week_starts_on: family.week_starts_on,
    marketplace_enabled: family.marketplace_enabled,
  })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [saved, setSaved] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); setSaved(false) }

  async function save(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const payload = {
      name: form.name.trim(),
      weekly_token_allowance: Number(form.weekly_token_allowance),
      screen_time_minutes_per_token: Number(form.screen_time_minutes_per_token),
      reading_minutes_per_token: Number(form.reading_minutes_per_token),
      cash_per_unspent_token_cents: Number(form.cash_per_unspent_token_cents),
      week_starts_on: Number(form.week_starts_on),
      marketplace_enabled: !!form.marketplace_enabled,
    }
    const { error } = await supabase.from('families').update(payload).eq('id', family.id)
    setBusy(false)
    if (error) { setErr(error.message); return }
    setSaved(true)
    reload()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Family rules</h1>
      <form onSubmit={save} className="panel p-5 space-y-4">
        <div>
          <label className="label">Family name</label>
          <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Weekly allowance (tokens)</label>
            <input className="input" type="number" min="0" required value={form.weekly_token_allowance} onChange={(e) => set('weekly_token_allowance', e.target.value)} />
          </div>
          <div>
            <label className="label">Screen time per token (min)</label>
            <input className="input" type="number" min="1" required value={form.screen_time_minutes_per_token} onChange={(e) => set('screen_time_minutes_per_token', e.target.value)} />
          </div>
          <div>
            <label className="label">Reading per token (min)</label>
            <input className="input" type="number" min="1" required value={form.reading_minutes_per_token} onChange={(e) => set('reading_minutes_per_token', e.target.value)} />
          </div>
          <div>
            <label className="label">Cash per unspent token (¢)</label>
            <input className="input" type="number" min="0" required value={form.cash_per_unspent_token_cents} onChange={(e) => set('cash_per_unspent_token_cents', e.target.value)} />
          </div>
          <div>
            <label className="label">Week starts on</label>
            <select className="input" value={form.week_starts_on} onChange={(e) => set('week_starts_on', e.target.value)}>
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        </div>

        <div className="panel-2 p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.marketplace_enabled} onChange={(e) => set('marketplace_enabled', e.target.checked)} />
            <span>
              <strong>Marketplace enabled</strong>
              <span className="block text-xs opacity-70">Allow tokens to be sent to/from kids in other families.</span>
            </span>
          </label>
        </div>

        {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
        {saved && <div className="text-sm text-[var(--teal)]">Saved.</div>}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  )
}
