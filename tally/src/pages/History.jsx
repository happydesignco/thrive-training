import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { weekAnchor, addDays, formatWeekLabel } from '../lib/week.js'
import KidAvatar from '../components/KidAvatar.jsx'

export default function History() {
  const { family, kids, reload: reloadFamily } = useFamily()
  const [cashouts, setCashouts] = useState([])
  const [busy, setBusy] = useState(null)
  const thisWeek = weekAnchor(new Date(), family?.week_starts_on ?? 0)
  const lastWeek = addDays(thisWeek, -7)

  async function load() {
    if (!kids.length) { setCashouts([]); return }
    const ids = kids.map((k) => k.id)
    const { data } = await supabase
      .from('weekly_cashouts').select('*').in('kid_id', ids).order('week_anchor', { ascending: false }).limit(50)
    setCashouts(data ?? [])
  }
  useEffect(() => { load() /* eslint-disable-next-line */ }, [kids])

  async function closeWeekFor(kid, weekStr) {
    setBusy(kid.id + weekStr)
    const { error } = await supabase.rpc('close_week', { p_kid_id: kid.id, p_week_anchor: weekStr })
    setBusy(null)
    if (error) { alert(error.message); return }
    await Promise.all([load(), reloadFamily()])
  }

  const byKid = (kid) => cashouts.filter((c) => c.kid_id === kid.id)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Weekly history & cashout</h1>

      <section className="panel p-4 text-sm opacity-80">
        Current week: <strong>{formatWeekLabel(thisWeek)}</strong>. Cash out last week (<strong>{formatWeekLabel(lastWeek)}</strong>) from each kid's card below.
      </section>

      <div className="space-y-4">
        {kids.map((kid) => {
          const rows = byKid(kid)
          const closedThis = rows.some((r) => r.week_anchor === thisWeek)
          const closedLast = rows.some((r) => r.week_anchor === lastWeek)
          return (
            <section key={kid.id} className="panel p-5">
              <header className="flex items-center gap-3 mb-3">
                <KidAvatar kid={kid} />
                <div className="flex-1">
                  <div className="font-semibold">{kid.name}</div>
                  <div className="text-xs opacity-60">
                    Lifetime cashouts: $
                    {(rows.reduce((s, r) => s + r.cents_earned, 0) / 100).toFixed(2)}
                  </div>
                </div>
                <button
                  className="btn-secondary btn text-sm"
                  disabled={closedLast || busy === kid.id + lastWeek}
                  onClick={() => closeWeekFor(kid, lastWeek)}
                >
                  {closedLast ? 'Last week closed' : 'Cash out last week'}
                </button>
                <button
                  className="btn-ghost btn text-sm"
                  disabled={closedThis || busy === kid.id + thisWeek}
                  onClick={() => {
                    if (!confirm('Close THIS week early? Usually wait until the week ends.')) return
                    closeWeekFor(kid, thisWeek)
                  }}
                >
                  {closedThis ? 'This week closed' : 'Close this week'}
                </button>
              </header>

              {rows.length === 0 ? (
                <div className="opacity-60 text-sm">No cashouts yet.</div>
              ) : (
                <ul className="space-y-2">
                  {rows.map((r) => (
                    <li key={r.id} className="panel-2 p-3 flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-medium">{formatWeekLabel(r.week_anchor)}</div>
                        <div className="text-xs opacity-70">
                          earned +{r.earned_tokens} · spent −{r.spent_tokens} · in +{r.transfer_in} · out −{r.transfer_out}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="token-amount">{r.remaining_tokens}</div>
                        <div className="text-xs text-[var(--gold)]">${(r.cents_earned / 100).toFixed(2)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
