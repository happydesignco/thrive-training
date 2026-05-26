import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import KidAvatar from '../components/KidAvatar.jsx'

export default function SendTokens() {
  const { id } = useParams()
  const { family, kids, balances } = useFamily()
  const nav = useNavigate()
  const sender = kids.find((k) => k.id === id)
  const balance = balances[id] ?? 0
  const otherKidsInFamily = kids.filter((k) => k.id !== id)
  const [mode, setMode] = useState('same') // 'same' | 'cross'
  const [recipientKidId, setRecipientKidId] = useState(otherKidsInFamily[0]?.id ?? '')
  const [inviteCode, setInviteCode] = useState('')
  const [crossResults, setCrossResults] = useState([])
  const [crossPick, setCrossPick] = useState(null)
  const [amount, setAmount] = useState(1)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [done, setDone] = useState(null)

  if (!sender) return <div className="opacity-70">Kid not found.</div>

  async function lookup() {
    setBusy(true); setErr(null); setCrossResults([])
    const { data, error } = await supabase.rpc('lookup_family_by_invite', { p_code: inviteCode })
    setBusy(false)
    if (error) { setErr(error.message); return }
    if (!data || data.length === 0) { setErr('No family found, or marketplace is disabled.'); return }
    setCrossResults(data)
  }

  async function submit(e) {
    e.preventDefault()
    setErr(null)
    if (amount > balance) { setErr(`Only ${balance} tokens available`); return }
    let to_kid_id, to_kid_name, to_family_name
    if (mode === 'same') {
      to_kid_id = recipientKidId
      const recipKid = kids.find((k) => k.id === recipientKidId)
      to_kid_name = recipKid?.name ?? '?'
      to_family_name = family.name
    } else {
      if (!crossPick) { setErr('Pick a recipient'); return }
      to_kid_id = crossPick.kid_id
      to_kid_name = crossPick.kid_name
      to_family_name = crossPick.family_name
    }
    if (!to_kid_id) { setErr('Pick a recipient'); return }
    setBusy(true)
    const { data, error } = await supabase.from('transfers').insert({
      from_kid_id: sender.id,
      to_kid_id,
      from_kid_name: sender.name,
      to_kid_name,
      from_family_name: family.name,
      to_family_name,
      amount: Number(amount),
      note: note.trim() || null,
      same_family: mode === 'same',
    }).select().single()
    setBusy(false)
    if (error) { setErr(error.message); return }

    // If same-family, the sender's parent can auto-approve on the spot via the same RPC.
    setDone(data)
  }

  if (done) {
    return (
      <div className="panel p-6 text-center space-y-3">
        <div className="text-5xl">🤝</div>
        <h1 className="text-xl font-bold">Sent for approval</h1>
        <p className="opacity-80">
          {done.same_family
            ? "Asked your parent to approve the transfer."
            : "Asked both your parent and the recipient's parent. You'll see it in the Inbox when it goes through."}
        </p>
        <button className="btn" onClick={() => nav(`/kid/${sender.id}`)}>Back to my page</button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <KidAvatar kid={sender} />
        <h1 className="text-xl font-bold">Send tokens</h1>
      </header>

      <div className="panel p-4 text-sm opacity-80">
        Balance: <span className="token-amount text-[var(--gold)]">{balance}</span> tokens
      </div>

      <div className="flex gap-2">
        <button onClick={() => setMode('same')} className={`flex-1 btn ${mode === 'same' ? '' : 'btn-secondary'}`}>👨‍👩‍👧 Sibling</button>
        <button onClick={() => setMode('cross')} className={`flex-1 btn ${mode === 'cross' ? '' : 'btn-secondary'}`} disabled={!family.marketplace_enabled}>🏘️ Other family</button>
      </div>

      <form onSubmit={submit} className="panel p-5 space-y-4">
        {mode === 'same' ? (
          <div>
            <label className="label">Send to sibling</label>
            <select className="input" value={recipientKidId} onChange={(e) => setRecipientKidId(e.target.value)} required>
              {otherKidsInFamily.length === 0 && <option value="">(no siblings)</option>}
              {otherKidsInFamily.map((k) => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div>
              <label className="label">Family invite code</label>
              <div className="flex gap-2">
                <input className="input font-mono" placeholder="WHALE-1234"
                       value={inviteCode}
                       onChange={(e) => setInviteCode(e.target.value.toUpperCase())} />
                <button type="button" onClick={lookup} className="btn-secondary btn" disabled={busy || !inviteCode}>Look up</button>
              </div>
            </div>
            {crossResults.length > 0 && (
              <div>
                <label className="label">Pick a kid in <strong>{crossResults[0].family_name}</strong></label>
                <ul className="space-y-2">
                  {crossResults.map((r) => (
                    <li key={r.kid_id}>
                      <button
                        type="button"
                        onClick={() => setCrossPick(r)}
                        className={`panel-2 w-full p-3 text-left flex items-center gap-3 ${crossPick?.kid_id === r.kid_id ? 'border-[var(--gold)]' : ''}`}
                      >
                        <span className="kid-avatar" style={{ width: 36, height: 36, background: r.avatar_color, fontSize: 14 }}>
                          {r.kid_name.slice(0,2).toUpperCase()}
                        </span>
                        <span className="font-medium">{r.kid_name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div>
          <label className="label">Amount</label>
          <input className="input" type="number" min="1" max={balance} required value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="happy birthday!" />
        </div>
        {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={() => nav(-1)} className="btn-ghost btn flex-1">Cancel</button>
          <button className="btn flex-1" disabled={busy || balance === 0}>{busy ? 'Sending…' : 'Send for approval'}</button>
        </div>
      </form>
    </div>
  )
}
