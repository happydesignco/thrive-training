// Week math. All week_anchor values are local-time-based Sunday (or family's week_starts_on).
// We store as YYYY-MM-DD strings to keep tz drift out of the equation.

export function weekAnchor(date = new Date(), weekStartsOn = 0) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = d.getDay() // 0..6, 0 = Sunday
  const diff = (dow - weekStartsOn + 7) % 7
  d.setDate(d.getDate() - diff)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(yyyymmdd, n) {
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + n)
  return weekAnchor(dt, dt.getDay())
}

export function formatWeekLabel(yyyymmdd) {
  const [y, m, d] = yyyymmdd.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const end = new Date(dt)
  end.setDate(end.getDate() + 6)
  const f = (x) => x.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${f(dt)} – ${f(end)}`
}
