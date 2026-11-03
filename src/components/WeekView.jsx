import { useState, useEffect, useMemo } from 'react'
import { useUser } from '../hooks/useUser'
import { useWorkouts } from '../hooks/useWorkouts'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/workoutConstants'
import {
  LIFTS, WEEK_LABELS, COLOR_MAP,
  calcWeight, get531WeekIndex, getWeekSets,
} from '../utils/fiveThreeOne'
import PlateCalculator from './PlateCalculator'
import { supabase } from '../lib/supabase'
import SessionView, { SessionEditor } from './SessionView'
import {
  parseNote, parseSession, serializeSession, generateLiftSession,
  DEFAULT_LIFT_DAYS, LIFT_TEXT,
} from '../utils/session'

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

function dayDate(mondayStr, dayIdx) {
  const d = new Date(mondayStr + 'T00:00:00')
  d.setDate(d.getDate() + dayIdx)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Shrink a screenshot to a sensible size and return base64 JPEG.
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 1568 / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

const DAY_NAMES = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday',
  friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

function ImportWeek({ weekLabel, defaultDay, onSave, onClose }) {
  const [text, setText] = useState('')
  const [singleDay, setSingleDay] = useState(defaultDay || 'monday')
  const [reading, setReading] = useState(false)
  const [readError, setReadError] = useState('')

  async function readImage(file) {
    if (!file || !supabase) return
    setReading(true)
    setReadError('')
    try {
      const image = await imageToBase64(file)
      const { data, error } = await supabase.functions.invoke('parse-workout', {
        body: { image, media_type: 'image/jpeg' },
      })
      if (error) {
        const body = await error.context?.json?.().catch(() => null)
        throw new Error(body?.error || 'Couldn\'t read that image')
      }
      if (data.day && data.day !== 'none') setSingleDay(data.day)
      setText(data.text)
    } catch (err) {
      setReadError(err.message)
    } finally {
      setReading(false)
    }
  }

  function handlePaste(e) {
    const file = [...(e.clipboardData?.files || [])].find(f => f.type.startsWith('image/'))
    if (file) {
      e.preventDefault()
      readImage(file)
    }
  }
  const parsed = useMemo(() => (text.trim() ? parseNote(text) : null), [text])
  const days = parsed?.single ? { [singleDay]: parsed.single } : parsed?.days || {}
  const found = DAYS.filter(d => days[d])

  return (
    <div className="border border-magenta bg-card-bg p-4 mb-4 flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wider text-magenta">Add workout · week of {weekLabel}</p>
      <label className={`w-full py-2 text-xs uppercase tracking-wider text-center border rounded-md cursor-pointer transition-colors ${
        reading ? 'border-border opacity-50' : 'border-cyan text-cyan hover:bg-black'
      }`}>
        {reading ? 'Reading screenshot…' : 'Upload screenshot'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={reading}
          onChange={e => { readImage(e.target.files?.[0]); e.target.value = '' }}
        />
      </label>
      {readError && <p className="text-xs text-orange">{readError}</p>}
      <p className="text-[10px] opacity-50">Or paste the text (or a screenshot) below, then check it before saving.</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        onPaste={handlePaste}
        rows={10}
        placeholder={'Monday\nSquat 531\nChin ups 3x10\n\nBench 531\nSplit squat 3x8 each leg\n\nTuesday\n25 minute amrap\n...'}
        className="w-full px-2 py-1.5 text-sm bg-black border border-border rounded font-mono focus:border-magenta focus:outline-none"
      />
      {parsed?.single && (
        <label className="text-xs flex items-center gap-2">
          <span className="opacity-50">Put it on</span>
          <select
            value={singleDay}
            onChange={e => setSingleDay(e.target.value)}
            className="bg-black border border-border rounded px-2 py-1 text-xs"
          >
            {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
          </select>
        </label>
      )}
      {found.length > 0 && (
        <p className="text-xs opacity-60">
          {found.length === 1
            ? `Saves to ${DAY_NAMES[found[0]]}, replacing what's there.`
            : `Found ${found.map(d => DAY_LABELS[d]).join(', ')}. Saving replaces those days.`}
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => onSave(days)}
          disabled={!found.length}
          className="px-3 py-1.5 text-xs bg-magenta text-black rounded font-bold disabled:opacity-30"
        >
          Save
        </button>
        <button onClick={onClose} className="px-3 py-1.5 text-xs opacity-50 hover:opacity-100">
          Cancel
        </button>
      </div>
    </div>
  )
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
  const { filterWorkouts, getWorkoutById, loading: workoutsLoading } = useWorkouts()
  const schedule = getSchedule()

  const [weekOffset, setWeekOffset] = useState(0)
  const [expandedDay, setExpandedDay] = useState(null)
  const [swappingDay, setSwappingDay] = useState(null)
  const [plateCalcWeight, setPlateCalcWeight] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [customText, setCustomText] = useState('')
  const [editingDay, setEditingDay] = useState(null)
  const [shuffles, setShuffles] = useState({})
  const [showImport, setShowImport] = useState(false)

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
    setEditingDay(null)
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

    const liftOrder = LIFTS.map(l => l.key)
    const assignedLiftKeys = Object.entries(fiveThreeOneData.dayAssignments)
      .filter(([, assignedDay]) => assignedDay === day)
      .map(([liftKey]) => liftKey)
      .sort((a, b) => liftOrder.indexOf(a) - liftOrder.indexOf(b))

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

  const lift531 = useMemo(() => {
    const d = fiveThreeOneData
    if (!d?.startDate) return { configured: false, weights: d?.weights }
    const weekIndex = get531WeekIndex(d.startDate, weekStart, d.useDeload)
    return {
      configured: true,
      weekIndex,
      weekLabel: WEEK_LABELS[weekIndex],
      isDeload: !!d.useDeload && weekIndex === 3,
      cycleLength: d.useDeload ? 4 : 3,
      sets: getWeekSets(weekIndex, d.useDeload),
      weights: d.weights || {},
      mode: d.mode,
      useRounding: d.useRounding,
    }
  }, [fiveThreeOneData, weekStart])

  function liftKeysFor(day) {
    const assigned = fiveThreeOneData?.dayAssignments
    if (assigned && Object.keys(assigned).length) {
      const order = ['squat', 'bench', 'deadlift', 'press']
      const keys = Object.entries(assigned)
        .filter(([, d]) => d === day)
        .map(([k]) => k)
        .sort((a, b) => order.indexOf(a) - order.indexOf(b))
      if (keys.length) return keys
    }
    return DEFAULT_LIFT_DAYS[day] || []
  }

  function defaultLiftSession(day) {
    const keys = liftKeysFor(day)
    if (!keys.length) return null
    return generateLiftSession(keys, {
      seedStr: `${weekStart}:${day}`,
      shuffle: shuffles[day] || 0,
      deload: lift531.isDeload,
    })
  }

  function getAssignment(day) {
    const slotType = schedule.days[day]
    const asSession = (session, extra = {}) => ({
      type: 'session',
      session: slotType === 'run' && session.kind !== 'lift' ? { ...session, kind: 'run' } : session,
      ...extra,
    })

    // Check overrides first — works for any day including rest and 531
    if (assignments[day]) {
      const val = assignments[day]
      if (typeof val === 'object' && val.session) {
        return asSession(val.session, { overridden: true })
      }
      if (typeof val === 'object' && val.custom) {
        return { type: 'custom', text: val.custom, overridden: true }
      }
      const workout = getWorkoutById(val)
      if (workout) return { type: 'workout', workout, category: workout.category, overridden: true }
    }

    // Published week (e.g. Boyd's programming pasted in by the publisher)
    const pub = publisherWeekData[day]
    if (pub && typeof pub === 'object' && pub.session) {
      return asSession(pub.session, { published: true })
    }

    if (slotType === 'rest') return { type: 'rest' }
    if (slotType === '531') {
      const session = defaultLiftSession(day)
      return session ? asSession(session, { auto: true }) : get531Assignment(day)
    }
    if (slotType === 'run') {
      return asSession(parseSession('Easy run'), { auto: true })
    }

    // It's a workout category — check publisher data, then auto
    if (publisherWeekData[day]) {
      const workout = getWorkoutById(publisherWeekData[day])
      if (workout) return { type: 'workout', workout, category: slotType }
    }

    if (slotType === 'conditioning') return { type: 'pending' }

    const workout = getAutoWorkout(slotType)
    return workout ? { type: 'workout', workout, category: slotType } : { type: 'rest' }
  }

  function handleSwap(day, workoutId) {
    const next = { ...assignments, [day]: workoutId }
    setAssignments(next)
    setUserData(storageKey, next)
    setSwappingDay(null)
  }

  function saveSession(day, session) {
    handleSwap(day, { session })
    setEditingDay(null)
    setExpandedDay(day)
  }

  function handleImport(days) {
    const next = { ...assignments }
    for (const [day, session] of Object.entries(days)) next[day] = { session }
    setAssignments(next)
    setUserData(storageKey, next)
    setShowImport(false)
  }

  function startEdit(day) {
    setEditingDay(editingDay === day ? null : day)
    setSwappingDay(null)
    setExpandedDay(null)
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

      {showImport ? (
        <ImportWeek
          weekLabel={formatWeekRange(weekStart)}
          defaultDay={DAYS[todayIndex >= 0 ? Math.min(todayIndex + 1, 6) : 0]}
          onSave={handleImport}
          onClose={() => setShowImport(false)}
        />
      ) : (
        <button
          onClick={() => setShowImport(true)}
          className="w-full mb-4 py-2 text-xs uppercase tracking-wider border border-border rounded-md hover:border-magenta hover:text-magenta transition-colors"
        >
          + Add workout
        </button>
      )}

      {/* Days */}
      <div className="flex flex-col gap-3">
        {DAYS.map((day, dayIdx) => {
          const assignment = getAssignment(day)
          const isExpanded = expandedDay === day
          const isSwapping = swappingDay === day
          const isToday = dayIdx === todayIndex
          const is531Configured = assignment.type === '531' && assignment.configured
          const isSession = assignment.type === 'session'
          const isEditing = editingDay === day
          const date = dayDate(weekStart, dayIdx)

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
                  assignment.type === 'workout' || is531Configured || isSession ? 'cursor-pointer' : ''
                }`}
                onClick={() => {
                  if (assignment.type === 'workout' || is531Configured || isSession) {
                    setEditingDay(null)
                    setExpandedDay(isExpanded ? null : day)
                    setSwappingDay(null)
                  }
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs uppercase tracking-wider w-8 shrink-0 relative ${
                    isToday ? 'text-magenta font-bold' : 'opacity-50'
                  }`}>
                    {DAY_LABELS[day]}
                    {assignment.overridden && (
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-magenta" />
                    )}
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

                  {isSession && (() => {
                    const { session } = assignment
                    const lifts = session.blocks.flatMap(b => b.items).filter(i => i.lift)
                    const first = session.blocks[0]?.items[0]?.text || ''
                    const tag = session.kind === 'lift' ? null
                      : session.kind === 'run' ? { label: 'Run', color: 'var(--color-yellow)' }
                      : { label: 'HIIT', color: 'var(--color-cyan)' }
                    const sub = session.kind === 'lift'
                      ? (lift531.configured
                          ? `Wk ${lift531.weekIndex + 1}/${lift531.cycleLength} · ${lift531.isDeload ? 'Deload' : lift531.weekLabel}`
                          : 'Lift day')
                      : session.blocks.flatMap(b => b.items).slice(1, 3).map(i => i.text).join(' · ')
                    return (
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">
                            {lifts.length ? lifts.map((l, i) => {
                              const lift = LIFTS.find(x => x.key === l.lift)
                              return (
                                <span key={i}>
                                  {i > 0 && <span className="opacity-30"> · </span>}
                                  <span style={{ color: COLOR_MAP[lift.color] }}>{LIFT_TEXT[l.lift].toUpperCase()}</span>
                                </span>
                              )
                            }) : session.kind === 'lift'
                              ? <span className="text-yellow">LIGHT DAY</span>
                              : first}
                          </span>
                          {tag && (
                            <span
                              className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shrink-0"
                              style={{ color: tag.color, border: `1px solid ${tag.color}` }}
                            >{tag.label}</span>
                          )}
                        </div>
                        <p className="text-xs opacity-50 truncate">
                          {sub}{assignment.auto && session.kind === 'lift' ? ' · default pairings' : ''}
                        </p>
                      </div>
                    )
                  })()}

                  {assignment.type === 'pending' && (
                    <div className="min-w-0">
                      <span className="text-sm opacity-50">Conditioning</span>
                      <p className="text-xs opacity-40">Not posted yet</p>
                    </div>
                  )}

                  {assignment.type === 'custom' && (
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{assignment.text}</span>
                        <span
                          className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            color: 'var(--color-orange)',
                            border: '1px solid var(--color-orange)',
                          }}
                        >
                          Custom
                        </span>
                      </div>
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm opacity-30">Rest</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSwappingDay(isSwapping ? null : day)
                          setExpandedDay(null)
                          setSearchQuery('')
                          setCustomText('')
                        }}
                        className="w-5 h-5 flex items-center justify-center text-xs border border-border rounded-full opacity-30 hover:opacity-100 hover:border-magenta hover:text-magenta transition-all"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>

                {assignment.type === 'workout' && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSwappingDay(isSwapping ? null : day)
                        setExpandedDay(null)
                        setSearchQuery('')
                        setCustomText('')
                      }}
                      className="text-xs text-magenta hover:underline"
                    >
                      Swap
                    </button>
                    {assignment.overridden && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReset(day)
                        }}
                        className="text-xs text-orange hover:underline"
                      >
                        Reset
                      </button>
                    )}
                    <span className="text-xs opacity-30">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                  </div>
                )}

                {assignment.type === 'custom' && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSwappingDay(isSwapping ? null : day)
                        setExpandedDay(null)
                        setSearchQuery('')
                        setCustomText('')
                      }}
                      className="text-xs text-magenta hover:underline"
                    >
                      Swap
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleReset(day)
                      }}
                      className="text-xs text-orange hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {(isSession || assignment.type === 'pending') && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(day) }}
                      className="text-xs text-magenta hover:underline"
                    >
                      {assignment.type === 'pending' ? 'Add' : 'Edit'}
                    </button>
                    {assignment.overridden && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleReset(day) }}
                        className="text-xs text-orange hover:underline"
                      >
                        Reset
                      </button>
                    )}
                    {isSession && (
                      <span className="text-xs opacity-30">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                    )}
                  </div>
                )}

                {is531Configured && (
                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSwappingDay(isSwapping ? null : day)
                        setExpandedDay(null)
                        setSearchQuery('')
                        setCustomText('')
                      }}
                      className="text-xs text-magenta hover:underline"
                    >
                      Swap
                    </button>
                    <span className="text-xs opacity-30">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                  </div>
                )}
              </div>

              {/* Session editor */}
              {isEditing && (
                <div className="px-4 pb-4 pt-3 border-t border-border">
                  <SessionEditor
                    initialText={isSession ? serializeSession(assignment.session) : ''}
                    onSave={session => saveSession(day, session)}
                    onCancel={() => setEditingDay(null)}
                    onShuffle={schedule.days[day] === '531' && liftKeysFor(day).length ? () => {
                      const n = (shuffles[day] || 0) + 1
                      setShuffles({ ...shuffles, [day]: n })
                      return serializeSession(generateLiftSession(liftKeysFor(day), {
                        seedStr: `${weekStart}:${day}`, shuffle: n, deload: lift531.isDeload,
                      }))
                    } : null}
                  />
                  {assignment.type === 'pending' && (
                    <button
                      onClick={() => onNavigate?.('roulette')}
                      className="text-xs text-cyan hover:underline mt-2"
                    >
                      Or spin the roulette →
                    </button>
                  )}
                </div>
              )}

              {/* Expanded session */}
              {isExpanded && isSession && !isEditing && (
                <div className="px-4 pb-4 pt-3 border-t border-border">
                  <SessionView
                    session={assignment.session}
                    date={date}
                    lift531={lift531}
                    onPlate={setPlateCalcWeight}
                  />
                </div>
              )}

              {/* Swap picker */}
              {isSwapping && (
                <div className="px-4 pb-3 border-t border-border">
                  <input
                    type="text"
                    placeholder="Search workouts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full mt-3 mb-2 px-2 py-1.5 text-xs bg-black border border-border rounded font-mono focus:border-magenta focus:outline-none"
                  />

                  <div className="max-h-64 overflow-y-auto">
                    {['conditioning', 'metcon', 'accessory'].map(cat => {
                      const workouts = filterWorkouts({ category: cat, search: searchQuery })
                      if (workouts.length === 0) return null
                      return (
                        <div key={cat}>
                          <p
                            className="text-[9px] uppercase tracking-wider font-bold mt-2 mb-1 px-2"
                            style={{ color: CATEGORY_COLORS[cat] }}
                          >
                            {CATEGORY_LABELS[cat]}
                          </p>
                          {workouts.map(w => (
                            <button
                              key={w.id}
                              onClick={() => handleSwap(day, w.id)}
                              className={`text-left text-xs px-2 py-2 hover:bg-black transition-colors w-full ${
                                assignment.workout?.id === w.id ? 'text-magenta' : ''
                              }`}
                            >
                              <span className="font-semibold">{w.name}</span>
                              <span className="opacity-50 ml-2">{w.title}</span>
                            </button>
                          ))}
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-border mt-2 pt-2">
                    <p className="text-xs opacity-50 mb-1">Or add a custom activity</p>
                    <form
                      onSubmit={e => {
                        e.preventDefault()
                        if (customText.trim()) {
                          handleSwap(day, { custom: customText.trim() })
                          setCustomText('')
                        }
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        placeholder="e.g. Long Run"
                        value={customText}
                        onChange={e => setCustomText(e.target.value)}
                        className="flex-1 px-2 py-1.5 text-xs bg-black border border-border rounded font-mono focus:border-magenta focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!customText.trim()}
                        className="px-3 py-1.5 text-xs bg-magenta text-black rounded font-bold disabled:opacity-30"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  {assignments[day] && (
                    <button
                      onClick={() => handleReset(day)}
                      className="text-left text-xs px-2 py-2 text-orange hover:bg-black transition-colors mt-1 border-t border-border pt-2 w-full"
                    >
                      Reset to auto
                    </button>
                  )}
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
                                  {wgt && (
                                    <span
                                      className="font-bold text-sm underline cursor-pointer"
                                      onClick={(e) => { e.stopPropagation(); setPlateCalcWeight(Number(wgt)) }}
                                    >{wgt}</span>
                                  )}
                                </li>
                              )
                            })}
                            {assignment.useBBB && (
                              <li className="mb-1 text-xs flex justify-between max-w-[250px] opacity-60">
                                <span>5x10 @ 50%</span>
                                {hasWeight && (() => {
                                  const bbbWgt = calcWeight(lift.weight, 50, assignment.mode, assignment.useRounding)
                                  return (
                                    <span
                                      className="font-bold text-sm underline cursor-pointer"
                                      onClick={(e) => { e.stopPropagation(); setPlateCalcWeight(Number(bbbWgt)) }}
                                    >{bbbWgt}</span>
                                  )
                                })()}
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

      {plateCalcWeight !== null && (
        <PlateCalculator weight={plateCalcWeight} onClose={() => setPlateCalcWeight(null)} />
      )}
    </div>
  )
}
