import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import KidAvatar from '../components/KidAvatar.jsx'

export default function LogReading() {
  const { id } = useParams()
  const { family, kids } = useFamily()
  const nav = useNavigate()
  const kid = kids.find((k) => k.id === id)
  const [minutes, setMinutes] = useState(30)
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(false)

  if (!kid) return <div className="opacity-70">Kid not found.</div>

  const estimatedTokens = Math.max(1, Math.floor(minutes / family.reading_minutes_per_token))

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const { error } = await supabase.from('reading_log').insert({
      kid_id: kid.id,
      minutes: Number(minutes),
      book_title: title.trim() || null,
    })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="panel p-6 text-center space-y-3">
        <div className="text-5xl">✅</div>
        <h1 className="text-xl font-bold">Logged!</h1>
        <p className="opacity-80">Asked a parent to approve. Once they do, you'll get <span className="token-amount text-[var(--gold)]">{estimatedTokens}</span> {estimatedTokens === 1 ? 'token' : 'tokens'}.</p>
        <button className="btn" onClick={() => nav(`/kid/${kid.id}`)}>Back to my page</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <KidAvatar kid={kid} />
        <h1 className="text-xl font-bold">Log reading</h1>
      </header>

      <form onSubmit={submit} className="panel p-5 space-y-4">
        <div>
          <label className="label">Minutes</label>
          <div className="flex items-center gap-3">
            <input className="input" type="number" min="1" max="600" required value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            <div className="text-sm opacity-70 whitespace-nowrap">≈ <span className="token-amount text-[var(--gold)]">{estimatedTokens}</span> {estimatedTokens === 1 ? 'token' : 'tokens'}</div>
          </div>
          <div className="text-xs opacity-50 mt-1">{family.reading_minutes_per_token} min = 1 token</div>
        </div>
        <div>
          <label className="label">Book / what you read (optional)</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Harry Potter & the Goblet of Fire" />
        </div>
        {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={() => nav(-1)} className="btn-ghost btn flex-1">Cancel</button>
          <button className="btn flex-1" disabled={busy}>{busy ? 'Sending…' : 'Send for approval'}</button>
        </div>
      </form>
    </div>
  )
}
