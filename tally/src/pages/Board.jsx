import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'

export default function Board() {
  const { family } = useFamily()
  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true); setErr(null)
    // Pull neighborhoods I'm a member of by joining through neighborhood_members.
    const { data, error } = await supabase
      .from('neighborhood_members')
      .select('joined_at, neighborhood:neighborhoods(*)')
      .order('joined_at', { ascending: false })
    setLoading(false)
    if (error) { setErr(error.message); return }
    setNeighborhoods((data ?? []).map((r) => r.neighborhood).filter(Boolean))
  }, [])

  useEffect(() => { reload() }, [reload])

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Leaderboard</h1>
        <div className="flex gap-2">
          <button className="btn-ghost btn text-sm" onClick={() => setJoining(true)}>Join</button>
          <button className="btn text-sm" onClick={() => setCreating(true)}>+ Create</button>
        </div>
      </header>

      {err && <div className="text-sm text-[var(--coral)]">{err}</div>}

      {loading && <div className="opacity-70">Loading…</div>}

      {!loading && neighborhoods.length === 0 && (
        <div className="panel p-5 text-center">
          <div className="text-4xl mb-2">🏘️</div>
          <p className="opacity-80 mb-3">No neighborhoods yet. Create one and share the code, or join an existing one.</p>
          <p className="text-xs opacity-60">
            Your family is <strong>{family?.name}</strong> · invite code <span className="font-mono">{family?.invite_code}</span>
          </p>
        </div>
      )}

      <ul className="space-y-5">
        {neighborhoods.map((n) => (
          <li key={n.id}>
            <NeighborhoodCard n={n} onLeft={reload} />
          </li>
        ))}
      </ul>

      {creating && <CreateDialog onClose={() => setCreating(false)} onCreated={reload} />}
      {joining && <JoinDialog onClose={() => setJoining(false)} onJoined={reload} />}
    </div>
  )
}

function NeighborhoodCard({ n, onLeft }) {
  const [rows, setRows] = useState([])
  const [metric, setMetric] = useState('savers') // savers | readers
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  async function load() {
    setLoading(true); setErr(null)
    const { data, error } = await supabase.rpc('get_neighborhood_leaderboard', { p_neighborhood_id: n.id })
    setLoading(false)
    if (error) { setErr(error.message); return }
    setRows(data ?? [])
  }
  useEffect(() => { load() /* eslint-disable-next-line */ }, [n.id])

  const sorted = [...rows].sort((a, b) =>
    metric === 'savers'
      ? b.balance - a.balance
      : b.reading_minutes_this_week - a.reading_minutes_this_week,
  )

  async function copyCode() {
    try { await navigator.clipboard.writeText(n.join_code); } catch {}
  }
  async function leave() {
    if (!confirm(`Leave ${n.name}? Your kids' handles will stop appearing here.`)) return
    const { error } = await supabase.rpc('leave_neighborhood', { p_neighborhood_id: n.id })
    if (error) { alert(error.message); return }
    onLeft()
  }

  return (
    <div className="panel p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-2xl">🏘️</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{n.name}</div>
          <button onClick={copyCode} className="text-xs opacity-70 font-mono hover:opacity-100" title="Tap to copy">
            {n.join_code} 📋
          </button>
        </div>
        <button className="btn-ghost btn text-xs" onClick={leave}>Leave</button>
      </div>

      <div className="flex gap-2 mb-3">
        <button onClick={() => setMetric('savers')}
                className={`flex-1 btn text-sm ${metric === 'savers' ? '' : 'btn-secondary'}`}>
          💰 Top savers
        </button>
        <button onClick={() => setMetric('readers')}
                className={`flex-1 btn text-sm ${metric === 'readers' ? '' : 'btn-secondary'}`}>
          📖 Top readers this week
        </button>
      </div>

      {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
      {loading ? (
        <div className="opacity-70 text-sm">Loading…</div>
      ) : sorted.length === 0 ? (
        <div className="panel-2 p-4 text-sm opacity-80">
          No kids on the board yet. Have at least one kid pick a handle and turn on
          "Show on leaderboards" in the Kids tab.
        </div>
      ) : (
        <ol className="space-y-2">
          {sorted.map((r, i) => {
            const value = metric === 'savers' ? r.balance : r.reading_minutes_this_week
            const unit  = metric === 'savers' ? 'tokens' : 'min'
            return (
              <li key={`${r.handle}-${i}`} className={`flex items-center gap-3 p-2 rounded-lg ${r.is_mine ? 'bg-[var(--panel-2)] border border-[var(--gold)]' : ''}`}>
                <span className="w-6 text-right font-mono opacity-70">{i + 1}.</span>
                <span className="kid-avatar" style={{ width: 32, height: 32, background: r.avatar_color, fontSize: 12 }}>
                  {(r.handle || '?').slice(0, 2).toUpperCase()}
                </span>
                <span className="font-semibold flex-1 truncate">
                  {r.handle}
                  {r.is_mine && <span className="ml-2 text-xs text-[var(--gold)]">(you)</span>}
                </span>
                <span className="token-amount">
                  {value} <span className="text-xs opacity-60">{unit}</span>
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function CreateDialog({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const { error } = await supabase.rpc('create_neighborhood', { p_name: name.trim() })
    setBusy(false)
    if (error) { setErr(error.message); return }
    onCreated(); onClose()
  }
  return (
    <Modal title="Create a neighborhood" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Oak Street kids" />
          <p className="text-xs opacity-60 mt-1">You'll get a code to share with other families.</p>
        </div>
        {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
        <div className="flex gap-2">
          <button type="button" className="btn-ghost btn flex-1" onClick={onClose}>Cancel</button>
          <button className="btn flex-1" disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  )
}

function JoinDialog({ onClose, onJoined }) {
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const { error } = await supabase.rpc('join_neighborhood', { p_code: code })
    setBusy(false)
    if (error) { setErr(error.message); return }
    onJoined(); onClose()
  }
  return (
    <Modal title="Join a neighborhood" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Neighborhood code</label>
          <input className="input font-mono" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="OAK-1234" />
        </div>
        {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
        <div className="flex gap-2">
          <button type="button" className="btn-ghost btn flex-1" onClick={onClose}>Cancel</button>
          <button className="btn flex-1" disabled={busy}>{busy ? 'Joining…' : 'Join'}</button>
        </div>
      </form>
    </Modal>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="panel p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-3">{title}</h2>
        {children}
      </div>
    </div>
  )
}
