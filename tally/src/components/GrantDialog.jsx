import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { weekAnchor } from '../lib/week.js'

export default function GrantDialog({ kid, onClose, onSaved }) {
  const { family } = useFamily()
  const [amount, setAmount] = useState(1)
  const [direction, setDirection] = useState('grant')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function save(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const wa = weekAnchor(new Date(), family.week_starts_on)
    const delta = direction === 'grant' ? Number(amount) : -Number(amount)
    const kind  = direction === 'grant' ? 'manual_grant' : 'manual_deduct'
    const { error } = await supabase.from('transactions').insert({
      kid_id: kid.id, delta, kind, note: note.trim() || null, week_anchor: wa,
    })
    setBusy(false)
    if (error) { setErr(error.message); return }
    onSaved?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="panel p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-3">Adjust {kid.name}'s tokens</h2>
        <form onSubmit={save} className="space-y-3">
          <div className="flex gap-2">
            <button type="button"
                    onClick={() => setDirection('grant')}
                    className={`flex-1 btn ${direction === 'grant' ? '' : 'btn-secondary'}`}>+ Grant</button>
            <button type="button"
                    onClick={() => setDirection('deduct')}
                    className={`flex-1 btn ${direction === 'deduct' ? 'btn-danger' : 'btn-secondary'}`}>− Deduct</button>
          </div>
          <div>
            <label className="label">Amount</label>
            <input className="input" type="number" min="1" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="label">Reason (optional)</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="took out the trash" />
          </div>
          {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost btn flex-1" onClick={onClose}>Cancel</button>
            <button className="btn flex-1" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
