import { useState, useEffect, useMemo } from 'react'
import { useUser } from '../hooks/useUser'
import { filterWorkouts, getWorkoutById, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/workouts'
import {
  LIFTS, WEEK_LABELS, COLOR_MAP,
  calcWeight, get531WeekIndex, getWeekSets,
} from '../utils/fiveThreeOne'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

const SECTION_COLORS = [
  'var(--color-magenta)',
  'var(--color-cyan)',
  'var(--color-neon-green)',
  'var(--color-yellow)',
  'var(--color-orange)',
]

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatWeekRange(mondayStr) {
  const monday = new Date(mondayStr + 'T00:00:00')
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  const opts = { month: 'short', day: 'numeric' }
  return `${monday.toLocaleDateString('en-US', opts)} – ${sunday.toLocaleDateString('en-US', opts)}`
}

function getWeekNumber(mondayStr) {
  const monday = new Date(mondayStr + 'T00:00:00')
  const start = new Date(monday.getFullYear(), 0, 1)
  return Math.floor((monday - start) / (7 * 24 * 60 * 60 * 1000))
}

function getTodayIndex(mondayStr) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const monday = new Date(mondayStr + 'T00:00:00')
  const diff = Math.round((today - monday) / (24 * 60 * 60 * 1000))
  return diff >= 0 && diff < 7 ? diff : -1
}

export default function WeekView({ onNavigate }) {
  const { getUserData, setUserData, getSchedule, publisherWeekData, setActiveWeekStart } = useUser()
  const schedule = getSchedule()

  const [weekOffset, setWeekOffset] = useState(0)
  const [expandedDay, setExpandedDay] = useState(null)
  const [swappingDay, setSwappingDay] = useState(null)

  const weekStart = useMemo(() => {
    const m = getMonday(new Date())
    m.setDate(m.getDate() + weekOffset * 7)
    return m.toISOString().slice(0, 10)
  }, [weekOffset])

  const storageKey = `week:${weekStart}`
  const weekNum = getWeekNumber(weekStart)
  const todayIndex = getTodayIndex(weekStart)

  const [assignments, setAssignments] = useState(() => getUserData(storageKey) || {})

  useEffect(() => {
    setActiveWeekStart(weekStart)
  }, [weekStart, setActiveWeekStart])

  const fiveThreeOneData = useMemo(() => getUserData('531'), [getUserData])

  useEffect(() => {
    setAssignments(getUserData(storageKey) || {})
    setExpandedDay(null)
    setSwappingDay(null)
  }, [storageKey, getUserData])

  function getAutoWorkout(category) {
    const pool = filterWorkouts({ category })
    if (pool.length === 0) return null
    return pool[weekNum % pool.length]
  }

  function get531Assignment(day) {
    if (!fiveThreeOneData?.startDate || !fiveThreeOneData?.dayAssignments) {
      return { type: '531' }
    }

    const assignedLiftKeys = Object.entries(fiveThreeOneData.dayAssignments)
      .filter(([, assignedDay]) => assignedDay === day)
      .map(([liftKey]) => liftKey)

    if (assignedLiftKeys.length === 0) return { type: '531' }

    const weekIndex = get531WeekIndex(fiveThreeOneData.startDate, weekStart, fiveThreeOneData.useDeload)
    const sets = getWeekSets(weekIndex, fiveThreeOneData.useDeload)
    const cycleLength = fiveThreeOneData.useDeload ? 4 : 3

    const lifts = assignedLiftKeys
      .map(key => LIFTS.find(l => l.key === key))
      .filter(Boolean)
      .map(lift => ({
        ...lift,
        weight: fiveThreeOneData.weights?.[lift.key],
      }))

    return {
      type: '531',
      configured: true,
      weekIndex,
      weekLabel: WEEK_LABELS[weekIndex],
      cycleLength,
      sets,
      lifts,
      mode: fiveThreeOneData.mode,
      useRounding: fiveThreeOneData.useRounding,
      useBBB: fiveThreeOneData.useBBB,
    }
  }

  function getAssignment(day) {
    const slotType = schedule.days[day]
    if (slotType === 'rest') return { type: 'rest' }
    if (slotType === '531') return get531Assignment(day)

    // It's a workout category (conditioning, metcon, accessory)
    if (assignments[day]) {
      const workout = getWorkoutById(assignments[day])
      if (workout) return { type: 'workout', workout, category: slotType }
    }

    if (publisherWeekData[day]) {
      const workout = getWorkoutById(publisherWeekData[day])
      if (workout) return { type: 'workout', workout, category: slotType }
    }

    const workout = getAutoWorkout(slotType)
    return workout ? { type: 'workout', workout, category: slotType } : { type: 'rest' }
  }

  function handleSwap(day, workoutId) {
    const next = { ...assignments, [day]: workoutId }
    setAssignments(next)
    setUserData(storageKey, next)
    setSwappingDay(null)
  }

  function handleReset(day) {
    const next = { ...assignments }
    delete next[day]
    setAssignments(next)
    setUserData(storageKey, next)
  }

  return (
    <div>
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setWeekOffset(o => o - 1)}
          className="px-3 py-1 text-sm border border-border rounded-md hover:border-white transition-colors"
        >
          &larr;
        </button>
        <div className="text-center">
          <p className="text-sm font-mono">{formatWeekRange(weekStart)}</p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-magenta mt-1"
            >
              This week
            </button>
          )}
        </div>
        <button
          onClick={() => setWeekOffset(o => o + 1)}
          className="px-3 py-1 text-sm border border-border rounded-md hover:border-white transition-colors"
        >
          &rarr;
        </button>
      </div>

      {/* Days */}
      <div className="flex flex-col gap-3">
        {DAYS.map((day, dayIdx) => {
          const assignment = getAssignment(day)
          const isExpanded = expandedDay === day
          const isSwapping = swappingDay === day
          const isToday = dayIdx === todayIndex
          const is531Configured = assignment.type === '531' && assignment.configured

          return (
            <div
              key={day}
              className={`border bg-card-bg transition-colors ${
                isToday ? 'border-magenta' : 'border-border'
              }`}
            >
              {/* Day header */}
              <div
                className={`flex items-center justify-between px-4 py-3 ${
                  assignment.type === 'workout' || is531Configured ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (assignment.type === 'workout' || is531Configured) {
                    setExpandedDay(isExpanded ? null : day)
                    setSwappingDay(null)
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs uppercase tracking-wider w-8 shrink-0 ${
                    isToday ? 'text-magenta font-bold' : 'opacity-50'
                  }`}>
                    {DAY_LABELS[day]}
                  </span>

                  {assignment.type === 'workout' && (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{assignment.workout.name}</span>
                        <span
                          className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            color: CATEGORY_COLORS[assignment.category],
                            border: `1px solid ${CATEGORY_COLORS[assignment.category]}`,
                          }}
                        >
                          {CATEGORY_LABELS[assignment.category] || assignment.category}
                        </span>
                      </div>
                      <p className="text-xs opacity-50 truncate">{assignment.workout.excerpt || assignment.workout.title}</p>
                    </div>
                  )}

                  {assignment.type === '531' && is531Configured && (
                    <div className="min-w-0">
                      <span className="text-sm font-semibold">
                        {assignment.lifts.map((l, i) => (
                          <span key={l.key}>
                            {i > 0 && <span className="opacity-30"> · </span>}
                            <span style={{ color: COLOR_MAP[l.color] }}>{l.key.toUpperCase()}</span>
                          </span>
                        ))}
                      </span>
                      <p className="text-xs opacity-50 truncate">
                        Wk {assignment.weekIndex + 1}/{assignment.cycleLength} — {assignment.weekLabel}
                      </p>
                    </div>
                  )}

                  {assignment.type === '531' && !is531Configured && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onNavigate?.('531')
                      }}
                      className="text-sm text-cyan hover:underline"
                    >
                      5/3/1 Strength
                    </button>
                  )}

                  {assignment.type === 'rest' && (
                    <span className="text-sm opacity-30">Rest</span>
                  )}
                </div>

                {assignment.type === 'workout' && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSwappingDay(isSwapping ? null : day)
                        setExpandedDay(null)
                      }}
                      className="text-xs text-magenta hover:underline"
                    >
                      Swap
                    </button>
                    <span className="text-xs opacity-30">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                  </div>
                )}

                {is531Configured && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <span className="text-xs opacity-30">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                  </div>
                )}
              </div>

              {/* Swap picker */}
              {isSwapping && (
                <div className="px-4 pb-3 border-t border-border">
                  <p className="text-xs opacity-50 uppercase tracking-wider mt-3 mb-2">
                    Choose a workout
                  </p>
                  <div className="flex flex-col gap-1">
                    {filterWorkouts({ category: assignment.category }).map(w => (
                      <button
                        key={w.id}
                        onClick={() => handleSwap(day, w.id)}
                        className={`text-left text-xs px-2 py-2 hover:bg-black transition-colors ${
                          assignment.workout?.id === w.id ? 'text-magenta' : ''
                        }`}
                      >
                        <span className="font-semibold">{w.name}</span>
                        <span className="opacity-50 ml-2">{w.title}</span>
                      </button>
                    ))}
                    {assignments[day] && (
                      <button
                        onClick={() => handleReset(day)}
                        className="text-left text-xs px-2 py-2 text-orange hover:bg-black transition-colors mt-1 border-t border-border pt-2"
                      >
                        Reset to auto
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Expanded 5/3/1 details */}
              {isExpanded && is531Configured && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="mt-3 flex flex-col gap-3">
                    {assignment.lifts.map(lift => {
                      const baseColor = COLOR_MAP[lift.color]
                      const hasWeight = parseFloat(lift.weight) > 0
                      return (
                        <div key={lift.key} className="flex flex-col gap-1">
                          <p className="text-xs uppercase tracking-wider font-bold" style={{ color: baseColor }}>
                            {lift.key.toUpperCase()}
                          </p>
                          <ul
                            className="list-none pl-4"
                            style={{ borderLeft: `2px solid ${baseColor}` }}
                          >
                            {assignment.sets.map((s, idx) => {
                              const wgt = hasWeight
                                ? calcWeight(lift.weight, s.p, assignment.mode, assignment.useRounding)
                                : null
                              return (
                                <li key={idx} className="mb-1 text-xs flex justify-between max-w-[250px]">
                                  <span>{s.r} reps @ {s.p}%</span>
                                  {wgt && <span className="font-bold text-sm">{wgt}</span>}
                                </li>
                              )
                            })}
                            {assignment.useBBB && (
                              <li className="mb-1 text-xs flex justify-between max-w-[250px] opacity-60">
                                <span>5x10 @ 50%</span>
                                {hasWeight && (
                                  <span className="font-bold text-sm">
                                    {calcWeight(lift.weight, 50, assignment.mode, assignment.useRounding)}
                                  </span>
                                )}
                              </li>
                            )}
                          </ul>
                        </div>
                      )
                    })}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onNavigate?.('531')
                      }}
                      className="text-xs text-cyan hover:underline text-left mt-1"
                    >
                      Edit in 5/3/1 →
                    </button>
                  </div>
                </div>
              )}

              {/* Expanded workout details */}
              {isExpanded && assignment.type === 'workout' && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="mt-3 flex flex-col gap-3">
                    {Object.entries(assignment.workout.sections).map(([key, section], idx) => {
                      const color = SECTION_COLORS[idx % SECTION_COLORS.length]
                      return (
                        <div key={key} className="flex flex-col gap-1">
                          <p className="text-xs uppercase tracking-wider opacity-50">{section.type}</p>
                          {section.title && (
                            <h4 className="text-sm font-bold" style={{ color }}>{section.title}</h4>
                          )}
                          <ul className="list-none pl-4" style={{ borderLeft: `2px solid ${color}` }}>
                            {section.description.map((line, i) => (
                              <li key={i} className="mb-1 text-xs">{line}</li>
                            ))}
                          </ul>
                          {section.alternatives && (
                            <ul className="list-none pl-4 opacity-50" style={{ borderLeft: `2px solid ${color}` }}>
                              {section.alternatives.map((alt, i) => (
                                <li key={i} className="mb-1 text-xs">{alt}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                    {assignment.workout.scaling && (
                      <div className="text-xs opacity-50 border-t border-border pt-2 mt-1">
                        {Object.entries(assignment.workout.scaling).map(([k, v]) => (
                          <p key={k}><span className="uppercase">{k}:</span> {v}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
