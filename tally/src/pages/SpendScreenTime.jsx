import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { weekAnchor } from '../lib/week.js'
import KidAvatar from '../components/KidAvatar.jsx'

export default function SpendScreenTime() {
  const { id } = useParams()
  const { family, kids, balances, reload } = useFamily()
  const nav = useNavigate()
  const kid = kids.find((k) => k.id === id)
  const balance = balances[id] ?? 0
  const [tokens, setTokens] = useState(1)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  if (!kid) return <div className="opacity-70">Kid not found.</div>

  const mins = tokens * family.screen_time_minutes_per_token

  async function submit(e) {
    e.preventDefault()
    setErr(null)
    if (tokens > balance) { setErr(`Only ${balance} tokens available`); return }
    setBusy(true)
    const wa = weekAnchor(new Date(), family.week_starts_on)
    const { error } = await supabase.from('transactions').insert({
      kid_id: kid.id,
      delta: -tokens,
      kind: 'screen_time_spent',
      note: `Screen time: ${mins} min`,
      week_anchor: wa,
    })
    setBusy(false)
    if (error) { setErr(error.message); return }
    await reload()
    nav(`/kid/${kid.id}`)
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <KidAvatar kid={kid} />
        <h1 className="text-xl font-bold">Spend on screen time</h1>
      </header>

      <div className="panel p-4 text-sm opacity-80">
        Balance: <span className="token-amount text-[var(--gold)]">{balance}</span> tokens
      </div>

      <form onSubmit={submit} className="panel p-5 space-y-4">
        <div>
          <label className="label">Tokens to spend</label>
          <input className="input" type="number" min="1" max={balance} required value={tokens} onChange={(e) => setTokens(Number(e.target.value))} />
          <div className="text-sm opacity-70 mt-2">= <strong>{mins}</strong> minutes of screen time</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].filter((n) => n <= balance).map((n) => (
            <button key={n} type="button" onClick={() => setTokens(n)} className="btn-secondary btn text-sm">
              {n} → {n * family.screen_time_minutes_per_token} min
            </button>
          ))}
        </div>
        {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={() => nav(-1)} className="btn-ghost btn flex-1">Cancel</button>
          <button className="btn flex-1" disabled={busy || balance === 0}>{busy ? 'Spending…' : 'Spend'}</button>
        </div>
      </form>
    </div>
  )
}
