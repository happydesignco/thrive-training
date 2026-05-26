import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { pinMatches } from '../lib/pin.js'
import { weekAnchor } from '../lib/week.js'
import KidAvatar from '../components/KidAvatar.jsx'
import PinPad from '../components/PinPad.jsx'
import LeaderboardSummary from '../components/LeaderboardSummary.jsx'

export default function KidView() {
  const { id } = useParams()
  const { family, kids, balances, reload } = useFamily()
  const nav = useNavigate()
  const kid = useMemo(() => kids.find((k) => k.id === id), [kids, id])
  const [unlocked, setUnlocked] = useState(false)
  const [recent, setRecent] = useState([])
  const [thisWeek, setThisWeek] = useState({ earned: 0, spent: 0, net: 0 })

  useEffect(() => {
    if (!unlocked || !kid) return
    let cancelled = false
    async function load() {
      const wa = weekAnchor(new Date(), family.week_starts_on)
      const [{ data: rows }] = await Promise.all([
        supabase.from('transactions').select('*').eq('kid_id', kid.id).order('created_at', { ascending: false }).limit(25),
      ])
      if (cancelled) return
      setRecent(rows ?? [])

      const { data: weekRows } = await supabase
        .from('transactions').select('delta, kind').eq('kid_id', kid.id).eq('week_anchor', wa)
      const earned = (weekRows ?? []).filter((r) => r.delta > 0).reduce((s, r) => s + r.delta, 0)
      const spent  = (weekRows ?? []).filter((r) => r.delta < 0).reduce((s, r) => s + -r.delta, 0)
      setThisWeek({ earned, spent, net: earned - spent })
    }
    load()
    return () => { cancelled = true }
  }, [unlocked, kid, family])

  if (!kid) return <div className="opacity-70">Kid not found.</div>

  if (!unlocked) {
    return (
      <div className="space-y-6 pt-8">
        <div className="flex flex-col items-center">
          <KidAvatar kid={kid} size="lg" />
          <h1 className="text-2xl font-bold mt-3">{kid.name}</h1>
        </div>
        <PinPad
          length={4}
          label="Enter your PIN"
          onSubmit={async (pin) => {
            const ok = await pinMatches(pin, kid.pin_hash)
            if (ok) setUnlocked(true)
            return ok
          }}
        />
        <div className="text-center">
          <button onClick={() => nav('/')} className="text-sm opacity-60 underline">Cancel</button>
        </div>
      </div>
    )
  }

  const balance = balances[kid.id] ?? 0
  const screenMins = balance * family.screen_time_minutes_per_token

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <KidAvatar kid={kid} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{kid.name}</h1>
          <div className="text-sm opacity-70">Welcome back</div>
        </div>
        <button className="ml-auto btn-ghost btn text-sm" onClick={() => { setUnlocked(false); reload() }}>Lock</button>
      </header>

      <section className="panel-2 p-5 text-center">
        <div className="text-sm uppercase tracking-wider opacity-70">Your balance</div>
        <div className="text-5xl font-extrabold text-[var(--gold)] my-1 token-amount">{balance}</div>
        <div className="opacity-70 text-sm">= {screenMins} min of screen time · or ${(balance * family.cash_per_unspent_token_cents / 100).toFixed(2)} at week end</div>
      </section>

      {kid.leaderboard_opt_in && kid.handle && (
        <LeaderboardSummary kid={kid} />
      )}

      <section className="grid grid-cols-2 gap-3">
        <Link to={`/kid/${kid.id}/log-reading`} className="panel p-4 text-center">
          <div className="text-3xl mb-1">📖</div>
          <div className="font-semibold">Log reading</div>
          <div className="text-xs opacity-60">Earn tokens</div>
        </Link>
        <Link to={`/kid/${kid.id}/spend`} className="panel p-4 text-center">
          <div className="text-3xl mb-1">📱</div>
          <div className="font-semibold">Spend on screen time</div>
          <div className="text-xs opacity-60">{family.screen_time_minutes_per_token} min per token</div>
        </Link>
        <Link to={`/kid/${kid.id}/send`} className="panel p-4 text-center col-span-2">
          <div className="text-3xl mb-1">🤝</div>
          <div className="font-semibold">Send tokens</div>
          <div className="text-xs opacity-60">To a sibling or another family</div>
        </Link>
      </section>

      <section className="panel p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold">This week</h2>
          <div className="text-sm opacity-70">
            +{thisWeek.earned} earned · −{thisWeek.spent} spent
          </div>
        </div>
        <div className="h-px bg-[var(--line)] my-2" />
        <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Recent activity</h3>
        {recent.length === 0 && <div className="opacity-60 text-sm">Nothing yet.</div>}
        <ul className="space-y-2">
          {recent.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <span className="text-xl">{iconFor(t.kind)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{t.note || labelFor(t.kind)}</div>
                <div className="text-xs opacity-50">{new Date(t.created_at).toLocaleString()}</div>
              </div>
              <span className={`token-amount ${t.delta >= 0 ? 'text-[var(--teal)]' : 'text-[var(--coral)]'}`}>
                {t.delta >= 0 ? '+' : ''}{t.delta}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function iconFor(kind) {
  switch (kind) {
    case 'weekly_allowance': return '🗓️'
    case 'reading_earned':   return '📖'
    case 'screen_time_spent': return '📱'
    case 'manual_grant':     return '🎁'
    case 'manual_deduct':    return '✂️'
    case 'transfer_in':      return '📨'
    case 'transfer_out':     return '📤'
    case 'cashout':          return '💰'
    default: return '•'
  }
}
function labelFor(kind) {
  return kind.replace(/_/g, ' ')
}
