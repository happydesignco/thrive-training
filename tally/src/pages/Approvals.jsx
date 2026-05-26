import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'

export default function Approvals() {
  const { family, kids, reload: reloadFamily } = useFamily()
  const [reading, setReading] = useState([])
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [err, setErr] = useState(null)

  const kidById = Object.fromEntries(kids.map((k) => [k.id, k]))
  const ourKidIds = new Set(kids.map((k) => k.id))

  async function load() {
    setLoading(true); setErr(null)
    const ids = kids.map((k) => k.id)
    if (!ids.length) { setReading([]); setTransfers([]); setLoading(false); return }
    const [r, t] = await Promise.all([
      supabase.from('reading_log').select('*').in('kid_id', ids).eq('status', 'pending').order('logged_at', { ascending: false }),
      supabase.from('transfers').select('*').eq('status', 'pending').order('initiated_at', { ascending: false }),
    ])
    if (r.error) setErr(r.error.message)
    if (t.error) setErr(t.error.message)
    setReading(r.data ?? [])
    setTransfers(t.data ?? [])

    // Pull names for any cross-family kids referenced (RLS allows reading their kid row indirectly via the transfer? — no, kids RLS limits to own family).
    // For cross-family, we have to display "an outside kid" with limited info.
    setLoading(false)
  }

  useEffect(() => { load() /* eslint-disable-next-line */ }, [kids])

  async function approveReading(r) {
    setBusy(r.id)
    const { error } = await supabase.rpc('approve_reading', { p_reading_id: r.id })
    setBusy(null)
    if (error) { alert(error.message); return }
    await Promise.all([load(), reloadFamily()])
  }
  async function rejectReading(r) {
    setBusy(r.id)
    const { error } = await supabase.rpc('reject_reading', { p_reading_id: r.id })
    setBusy(null)
    if (error) { alert(error.message); return }
    load()
  }
  async function approveTransfer(t) {
    setBusy(t.id)
    const { error } = await supabase.rpc('approve_transfer', { p_transfer_id: t.id })
    setBusy(null)
    if (error) { alert(error.message); return }
    await Promise.all([load(), reloadFamily()])
  }
  async function rejectTransfer(t) {
    setBusy(t.id)
    const { error } = await supabase.rpc('reject_transfer', { p_transfer_id: t.id, p_reason: 'Rejected by parent' })
    setBusy(null)
    if (error) { alert(error.message); return }
    load()
  }

  if (loading) return <div className="opacity-70">Loading…</div>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Inbox</h1>
      {err && <div className="text-sm text-[var(--coral)]">{err}</div>}

      <section>
        <h2 className="text-sm uppercase tracking-wider opacity-60 mb-2">Reading entries</h2>
        {reading.length === 0 ? (
          <div className="panel p-4 opacity-70">No pending reading.</div>
        ) : (
          <ul className="space-y-3">
            {reading.map((r) => {
              const kid = kidById[r.kid_id]
              const tokens = Math.max(1, Math.floor(r.minutes / family.reading_minutes_per_token))
              return (
                <li key={r.id} className="panel p-4">
                  <div className="flex items-center gap-3">
                    <span className="kid-avatar" style={{width:36,height:36,background:kid?.avatar_color,fontSize:14}}>
                      {kid?.name?.slice(0,2).toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{kid?.name}</div>
                      <div className="text-sm opacity-80 truncate">
                        {r.minutes} min{r.book_title ? ` · ${r.book_title}` : ''}
                      </div>
                      <div className="text-xs opacity-50">{new Date(r.logged_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-70">Will earn</div>
                      <div className="token-amount text-[var(--gold)]">+{tokens}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button className="btn flex-1" disabled={busy === r.id} onClick={() => approveReading(r)}>Approve</button>
                    <button className="btn-ghost btn flex-1" disabled={busy === r.id} onClick={() => rejectReading(r)}>Reject</button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider opacity-60 mb-2">Transfers</h2>
        {transfers.length === 0 ? (
          <div className="panel p-4 opacity-70">No pending transfers.</div>
        ) : (
          <ul className="space-y-3">
            {transfers.map((t) => <TransferRow key={t.id}
                                               t={t}
                                               kidById={kidById}
                                               ourKidIds={ourKidIds}
                                               onApprove={approveTransfer}
                                               onReject={rejectTransfer}
                                               busy={busy === t.id} />)}
          </ul>
        )}
      </section>
    </div>
  )
}

function TransferRow({ t, kidById, ourKidIds, onApprove, onReject, busy }) {
  const weAreSender = ourKidIds.has(t.from_kid_id)
  const weAreRecipient = ourKidIds.has(t.to_kid_id)
  const ourKid = kidById[weAreSender ? t.from_kid_id : t.to_kid_id]
  const direction = weAreSender ? 'out' : 'in'
  const otherSide = direction === 'out'
    ? `${t.to_kid_name}${t.same_family ? '' : ` (${t.to_family_name})`}`
    : `${t.from_kid_name}${t.same_family ? '' : ` (${t.from_family_name})`}`
  const canAct =
    (weAreSender && !t.sender_parent_decision) ||
    (weAreRecipient && !t.recipient_parent_decision && !t.same_family)

  return (
    <li className="panel p-4">
      <div className="flex items-center gap-3">
        <span className="kid-avatar" style={{width:36,height:36,background:ourKid?.avatar_color,fontSize:14}}>
          {ourKid?.name?.slice(0,2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">
            {ourKid?.name} {direction === 'out' ? '→' : '←'} {otherSide}
          </div>
          {t.note && <div className="text-sm opacity-80 truncate">"{t.note}"</div>}
          <div className="text-xs opacity-50">{new Date(t.initiated_at).toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-70">{direction === 'out' ? 'Sending' : 'Incoming'}</div>
          <div className={`token-amount ${direction === 'out' ? 'text-[var(--coral)]' : 'text-[var(--teal)]'}`}>
            {direction === 'out' ? '−' : '+'}{t.amount}
          </div>
        </div>
      </div>
      <div className="mt-2 text-xs opacity-60">
        Sender: {t.sender_parent_decision ?? 'waiting'} · Recipient: {t.same_family ? 'n/a' : (t.recipient_parent_decision ?? 'waiting')}
      </div>
      {canAct ? (
        <div className="flex gap-2 mt-3">
          <button className="btn flex-1" disabled={busy} onClick={() => onApprove(t)}>Approve</button>
          <button className="btn-ghost btn flex-1" disabled={busy} onClick={() => onReject(t)}>Reject</button>
        </div>
      ) : (
        <div className="mt-3 opacity-70 text-sm">Waiting on the other side.</div>
      )}
    </li>
  )
}
