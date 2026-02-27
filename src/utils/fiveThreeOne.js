import { roundToNearest } from './rounding'

export const LIFTS = [
  { key: 'squat', label: 'Back Squat', color: 'magenta' },
  { key: 'bench', label: 'Bench Press', color: 'cyan' },
  { key: 'deadlift', label: 'Deadlift', color: 'neon-green' },
  { key: 'press', label: 'Overhead Press', color: 'yellow' },
]

export const WEEK_SETS = [
  [{ p: 65, r: '5' }, { p: 75, r: '5' }, { p: 85, r: '5+' }],
  [{ p: 70, r: '3' }, { p: 80, r: '3' }, { p: 90, r: '3+' }],
  [{ p: 75, r: '5' }, { p: 85, r: '3' }, { p: 95, r: '1+' }],
]

export const DELOAD_SETS = [
  { p: 40, r: '5' }, { p: 50, r: '5' }, { p: 60, r: '5' },
]

export const WEEK_LABELS = ['5/5/5+', '3/3/3+', '5/3/1+', 'Deload']

export const COLOR_MAP = {
  magenta: 'var(--color-magenta)',
  cyan: 'var(--color-cyan)',
  'neon-green': 'var(--color-neon-green)',
  yellow: 'var(--color-yellow)',
}

export function calcWeight(value, pct, mode, useRounding) {
  const v = parseFloat(value) || 0
  if (!v) return null
  const tm = mode === '1rm' ? v * 0.9 : v
  const raw = (tm * pct) / 100
  return useRounding ? roundToNearest(raw, 5) : raw.toFixed(1)
}

export function get531WeekIndex(startDate, currentWeekStart, useDeload) {
  const start = new Date(startDate + 'T00:00:00')
  const current = new Date(currentWeekStart + 'T00:00:00')
  const diffWeeks = Math.round((current - start) / (7 * 24 * 60 * 60 * 1000))
  const cycleLength = useDeload ? 4 : 3
  return ((diffWeeks % cycleLength) + cycleLength) % cycleLength
}

export function getWeekSets(weekIndex, useDeload) {
  if (useDeload && weekIndex === 3) return DELOAD_SETS
  return WEEK_SETS[weekIndex] || WEEK_SETS[0]
}

