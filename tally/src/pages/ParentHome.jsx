import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { weekAnchor } from '../lib/week.js'
import KidAvatar from '../components/KidAvatar.jsx'
import GrantDialog from '../components/GrantDialog.jsx'

export default function ParentHome() {
  const { family, kids, balances, reload } = useFamily()
  const [pendingReading, setPendingReading] = useState(0)
  const [pendingTransfers, setPendingTransfers] = useState(0)
  const [busyKid, setBusyKid] = useState(null)
  const [granting, setGranting] = useState(null)
  const wa = weekAnchor(new Date(), family?.week_starts_on ?? 0)

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!kids.length) { setPendingReading(0); setPendingTransfers(0); return }
      const ids = kids.map((k) => k.id)
      const [{ count: rCount }, { count: tCount }] = await Promise.all([
        supabase.from('reading_log').select('id', { count: 'exact', head: true }).in('kid_id', ids).eq('status', 'pending'),
        supabase.from('transfers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      if (cancelled) return
      setPendingReading(rCount ?? 0)
      setPendingTransfers(tCount ?? 0)
    }
    load()
    return () => { cancelled = true }
  }, [kids])

  async function startWeekFor(kid) {
    setBusyKid(kid.id)
    const { error } = await supabase.rpc('start_week', { p_kid_id: kid.id, p_week_anchor: wa })
    setBusyKid(null)
    if (error) { alert(error.message); return }
    reload()
  }

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-70">Family</div>
            <div className="text-xl font-bold">{family.name}</div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-70">Invite code</div>
            <div className="font-mono text-lg">{family.invite_code}</div>
          </div>
        </div>
      </section>

      {(pendingReading > 0 || pendingTransfers > 0) && (
        <Link to="/approvals" className="panel-2 p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">You have things to approve</div>
            <div className="text-sm opacity-70">
              {pendingReading > 0 && <>{pendingReading} reading {pendingReading === 1 ? 'entry' : 'entries'}</>}
              {pendingReading > 0 && pendingTransfers > 0 && ' · '}
              {pendingTransfers > 0 && <>{pendingTransfers} transfer{pendingTransfers === 1 ? '' : 's'}</>}
            </div>
          </div>
          <span className="badge badge-gold">{pendingReading + pendingTransfers}</span>
        </Link>
      )}

      <section>
        <h2 className="text-sm uppercase tracking-wider opacity-60 mb-2">Kids</h2>
        {kids.length === 0 ? (
          <div className="panel p-6 text-center">
            <p className="opacity-80 mb-3">Add your first kid to get started.</p>
            <Link to="/kids" className="btn">Add a kid</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {kids.map((k) => (
              <li key={k.id} className="panel p-4 flex items-center gap-4">
                <KidAvatar kid={k} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{k.name}</div>
                  <div className="text-sm opacity-70">
                    <span className="token-amount">{balances[k.id] ?? 0}</span> tokens
                  </div>
                </div>
                <button className="btn-ghost btn text-sm" onClick={() => setGranting(k)} title="Grant or deduct tokens">±</button>
                <button
                  className="btn-ghost btn text-sm"
                  onClick={() => startWeekFor(k)}
                  disabled={busyKid === k.id}
                  title={`Issue weekly allowance (${family.weekly_token_allowance} tokens)`}
                >
                  {busyKid === k.id ? '…' : '+ Week'}
                </button>
                <Link to={`/kid/${k.id}`} className="btn-secondary btn text-sm">Open</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {granting && <GrantDialog kid={granting} onClose={() => setGranting(null)} onSaved={reload} />}

      <section>
        <h2 className="text-sm uppercase tracking-wider opacity-60 mb-2">This week</h2>
        <div className="panel p-4 text-sm opacity-80">
          Week of <strong>{wa}</strong>. Tap <em>+ Week</em> on each kid to issue this week's {family.weekly_token_allowance}-token allowance.
          Cash out unspent tokens from the <Link to="/history" className="underline">History</Link> tab when the week ends.
        </div>
      </section>
    </div>
  )
}
