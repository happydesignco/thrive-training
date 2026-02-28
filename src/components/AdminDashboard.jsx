import { useState, useEffect, useMemo } from 'react'
import { fetchUsers, fetchAllUserData, deleteUser } from '../lib/admin'
import { fetchPublishedSchedules } from '../lib/publishedSchedules'

function StatCard({ label, value }) {
  return (
    <div className="bg-card-bg border border-border rounded-lg p-3 text-center">
      <div className="text-2xl font-medium text-magenta">{value}</div>
      <div className="text-xs uppercase tracking-wider text-white/50 mt-1">{label}</div>
    </div>
  )
}

function UserDrillDown({ userData, user, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const schedule = userData.find(d => d.key === 'schedule')
  const config531 = userData.find(d => d.key === '531')
  const weeks = userData.filter(d => d.key.startsWith('week:')).sort((a, b) => b.key.localeCompare(a.key))

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteUser(user.id)
      onDelete(user.id)
    } catch (err) {
      alert('Delete failed: ' + err.message)
      setDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="px-4 py-3 border-t border-border/50 bg-black/20 space-y-3 text-xs">
      {/* Schedule */}
      <div>
        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Schedule</div>
        {schedule?.value ? (
          <div className="space-y-1">
            <div className="text-white/80">
              <span className="text-magenta">{schedule.value.name || 'Unnamed'}</span>
            </div>
            {schedule.value.days && (
              <div className="text-white/50">
                {Object.entries(schedule.value.days).map(([day, workout]) => (
                  <span key={day} className="mr-3">
                    <span className="text-white/70">{day}:</span> {typeof workout === 'string' ? workout : workout?.name || '—'}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-white/30 italic">No schedule</div>
        )}
      </div>

      {/* 5/3/1 Config */}
      <div>
        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">5/3/1 Config</div>
        {config531?.value ? (
          <div className="space-y-1">
            {config531.value.mode && (
              <div className="text-white/50">Mode: <span className="text-white/80">{config531.value.mode}</span></div>
            )}
            {config531.value.lifts && (
              <div className="text-white/50">
                {Object.entries(config531.value.lifts).map(([lift, data]) => (
                  <span key={lift} className="mr-3">
                    <span className="text-white/70">{lift}:</span> {typeof data === 'object' ? data.trainingMax || data.weight || '—' : data}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-white/30 italic">No 5/3/1 config</div>
        )}
      </div>

      {/* Recent Weeks */}
      <div>
        <div className="text-xs uppercase tracking-wider text-white/50 mb-1">Recent Weeks</div>
        {weeks.length > 0 ? (
          <div className="text-white/50 flex flex-wrap gap-1">
            {weeks.slice(0, 8).map(w => (
              <span key={w.key} className="bg-card-bg border border-border rounded px-2 py-0.5">
                {w.key.replace('week:', '')}
              </span>
            ))}
            {weeks.length > 8 && <span className="text-white/30">+{weeks.length - 8} more</span>}
          </div>
        ) : (
          <div className="text-white/30 italic">No week data</div>
        )}
      </div>

      {/* Delete User */}
      <div className="pt-2 border-t border-border/50">
        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-red-400/60 hover:text-red-400 text-xs uppercase tracking-wider transition-colors"
          >
            Delete User
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-xs">Delete {user.email}?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500/20 text-red-400 border border-red-500/30 rounded px-2 py-1 text-xs uppercase tracking-wider hover:bg-red-500/30 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-white/40 hover:text-white/60 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [allUserData, setAllUserData] = useState([])
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedUser, setExpandedUser] = useState(null)

  function handleDeleteUser(userId) {
    setUsers(prev => prev.filter(u => u.id !== userId))
    setAllUserData(prev => prev.filter(d => d.user_id !== userId))
    setSchedules(prev => prev.filter(s => s.publisherUserId !== userId))
    setExpandedUser(null)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [u, ud, s] = await Promise.all([
          fetchUsers(),
          fetchAllUserData(),
          fetchPublishedSchedules(),
        ])
        if (cancelled) return
        setUsers(u)
        setAllUserData(ud)
        setSchedules(s)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const userDataMap = useMemo(() => {
    const map = {}
    for (const row of allUserData) {
      if (!map[row.user_id]) map[row.user_id] = []
      map[row.user_id].push(row)
    }
    return map
  }, [allUserData])

  const stats = useMemo(() => {
    const now = Date.now()
    const day7 = 7 * 24 * 60 * 60 * 1000
    const day30 = 30 * 24 * 60 * 60 * 1000
    const active7 = users.filter(u => u.last_sign_in_at && (now - new Date(u.last_sign_in_at).getTime()) < day7).length
    const active30 = users.filter(u => u.last_sign_in_at && (now - new Date(u.last_sign_in_at).getTime()) < day30).length
    return { total: users.length, active7, active30, publishedSchedules: schedules.length }
  }, [users, schedules])

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aTime = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0
      const bTime = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0
      return bTime - aTime
    })
  }, [users])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/50 text-sm">Loading admin data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-400 text-sm">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={stats.total} />
        <StatCard label="Active 7d" value={stats.active7} />
        <StatCard label="Active 30d" value={stats.active30} />
        <StatCard label="Published Schedules" value={stats.publishedSchedules} />
      </div>

      {/* Users Table */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-white/50 mb-2">Users</h2>
        <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
          {sortedUsers.map(user => {
            const ud = userDataMap[user.id] || []
            const isExpanded = expandedUser === user.id
            return (
              <div key={user.id}>
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors border-b border-border/50 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/90 truncate">{user.email}</div>
                    <div className="text-xs text-white/40 mt-0.5">
                      Signed up {formatDate(user.created_at)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-white/50">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">
                      {ud.length} key{ud.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-white/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                {isExpanded && <UserDrillDown userData={ud} user={user} onDelete={handleDeleteUser} />}
              </div>
            )
          })}
          {sortedUsers.length === 0 && (
            <div className="px-4 py-6 text-center text-white/30 text-sm">No users found</div>
          )}
        </div>
      </div>

      {/* Published Schedules Table */}
      <div>
        <h2 className="text-xs uppercase tracking-wider text-white/50 mb-2">Published Schedules</h2>
        <div className="bg-card-bg border border-border rounded-lg overflow-hidden">
          {schedules.map(s => (
            <div key={s.id} className="px-4 py-3 flex items-center gap-4 border-b border-border/50 last:border-b-0">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/90">{s.name}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.username}</div>
              </div>
              <div className="text-xs text-white/50 text-right shrink-0">
                {s.days ? Object.keys(s.days).length : 0} day{(!s.days || Object.keys(s.days).length !== 1) ? 's' : ''}
              </div>
            </div>
          ))}
          {schedules.length === 0 && (
            <div className="px-4 py-6 text-center text-white/30 text-sm">No published schedules</div>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}
