import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

// Shows the kid's rank on each joined neighborhood, for both metrics.
export default function LeaderboardSummary({ kid }) {
  const [rows, setRows] = useState([])  // [{ neighborhood, saversRank, readersRank, total }]
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: members } = await supabase
        .from('neighborhood_members')
        .select('neighborhood:neighborhoods(*)')
      const neighborhoods = (members ?? []).map((m) => m.neighborhood).filter(Boolean)

      const results = await Promise.all(
        neighborhoods.map(async (n) => {
          const { data, error } = await supabase.rpc('get_neighborhood_leaderboard', { p_neighborhood_id: n.id })
          if (error || !data) return null
          const target = (kid.handle ?? '').toLowerCase()
          const savers = [...data].sort((a, b) => b.balance - a.balance)
          const readers = [...data].sort((a, b) => b.reading_minutes_this_week - a.reading_minutes_this_week)
          const sRank = savers.findIndex((r) => (r.handle ?? '').toLowerCase() === target)
          const rRank = readers.findIndex((r) => (r.handle ?? '').toLowerCase() === target)
          if (sRank < 0 && rRank < 0) return null
          return {
            neighborhood: n,
            saversRank: sRank >= 0 ? sRank + 1 : null,
            readersRank: rRank >= 0 ? rRank + 1 : null,
            total: data.length,
          }
        })
      )
      if (cancelled) return
      setRows(results.filter(Boolean))
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [kid.handle, kid.id])

  if (loading || rows.length === 0) return null

  return (
    <Link to="/board" className="panel-2 p-4 block">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🏆</span>
        <span className="font-semibold">Your rank</span>
        <span className="ml-auto text-xs opacity-60">as <span className="font-mono">{kid.handle}</span></span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.neighborhood.id} className="flex items-center text-sm">
            <span className="flex-1 truncate opacity-80">{r.neighborhood.name}</span>
            {r.saversRank && (
              <span className="badge badge-gold mr-2">💰 #{r.saversRank}/{r.total}</span>
            )}
            {r.readersRank && (
              <span className="badge badge-teal">📖 #{r.readersRank}/{r.total}</span>
            )}
          </li>
        ))}
      </ul>
    </Link>
  )
}
