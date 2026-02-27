import { useState, useEffect, useRef, useMemo } from 'react'
import { useUser } from '../hooks/useUser'
import {
  LIFTS, WEEK_SETS, DELOAD_SETS, WEEK_LABELS, COLOR_MAP,
  calcWeight as calcWeightUtil, get531WeekIndex,
} from '../utils/fiveThreeOne'

const DAY_LABELS = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function FiveThreeOne() {
  const { getUserData, setUserData, removeUserData, getSchedule } = useUser()
  const schedule = getSchedule()
  const fiveThreeOneDays = Object.entries(schedule.days)
    .filter(([, type]) => type === '531')
    .map(([day]) => day)

  const [view, setView] = useState('form') // 'form' | 'results'
  const [mode, setMode] = useState('tm')
  const [weights, setWeights] = useState({ squat: '', bench: '', deadlift: '', press: '' })
  const [useRounding, setUseRounding] = useState(true)
  const [useBBB, setUseBBB] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [useDeload, setUseDeload] = useState(false)
  const [dayAssignments, setDayAssignments] = useState({})
  const outputRef = useRef(null)

  // Load saved data on mount
  useEffect(() => {
    const saved = getUserData('531')
    if (saved) {
      setMode(saved.mode || 'tm')
      setWeights(saved.weights || { squat: '', bench: '', deadlift: '', press: '' })
      setUseRounding(saved.useRounding !== false)
      setUseBBB(saved.useBBB === true)
      setStartDate(saved.startDate || '')
      setUseDeload(saved.useDeload === true)
      setDayAssignments(saved.dayAssignments || {})
      if (Object.values(saved.weights || {}).some(v => v)) {
        setView('results')
      }
    }
  }, [getUserData])

  function save(w, m, r, b, sd, dl, da) {
    setUserData('531', {
      weights: w, mode: m, useRounding: r, useBBB: b,
      startDate: sd, useDeload: dl, dayAssignments: da,
    })
  }

  function handleCalculate() {
    save(weights, mode, useRounding, useBBB, startDate, useDeload, dayAssignments)
    setView('results')
  }

  function handleEdit() {
    setView('form')
  }

  function handleClear() {
    removeUserData('531')
    setWeights({ squat: '', bench: '', deadlift: '', press: '' })
    setMode('tm')
    setUseRounding(true)
    setUseBBB(false)
    setStartDate('')
    setUseDeload(false)
    setDayAssignments({})
    setView('form')
  }

  function handleCopy() {
    if (outputRef.current) {
      navigator.clipboard.writeText(outputRef.current.innerText)
    }
  }

  function calcWeight(value, pct) {
    return calcWeightUtil(value, pct, mode, useRounding)
  }

  const hasLifts = Object.values(weights).some(v => parseFloat(v) > 0)

  const currentWeekIndex = useMemo(() => {
    if (!startDate) return null
    const monday = getMonday(new Date())
    const weekStart = monday.toISOString().slice(0, 10)
    return get531WeekIndex(startDate, weekStart, useDeload)
  }, [startDate, useDeload])

  const allWeeks = useMemo(() => {
    const weeks = WEEK_SETS.map((sets, idx) => ({ sets, label: WEEK_LABELS[idx], num: idx + 1 }))
    if (useDeload) {
      weeks.push({ sets: DELOAD_SETS, label: WEEK_LABELS[3], num: 4 })
    }
    return weeks
  }, [useDeload])

  if (view === 'form') {
    return (
      <div className="max-w-[600px] mx-auto">
        <h2 className="text-xl mb-6">5/3/1 Calculator</h2>

        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-4">
          <label className="grid grid-cols-[2fr_3fr] gap-1 items-center">
            <span>Input Type</span>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-input-bg font-mono"
            >
              <option value="tm">Training Max (90% of 1RM)</option>
              <option value="1rm">One-Rep Max</option>
            </select>
          </label>

          {LIFTS.map(lift => (
            <label key={lift.key} className="grid grid-cols-[2fr_3fr] gap-1 items-center">
              <span>{lift.label}</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="lbs"
                value={weights[lift.key]}
                onChange={e => setWeights(prev => ({ ...prev, [lift.key]: e.target.value }))}
                className="w-full p-2 border border-border rounded-md bg-input-bg font-mono"
              />
            </label>
          ))}

          <label className="flex items-center md:col-span-2">
            <input
              type="checkbox"
              checked={useRounding}
              onChange={e => setUseRounding(e.target.checked)}
              className="thrive-checkbox"
            />
            Round weights to nearest 5 lbs
          </label>

          <label className="flex items-center md:col-span-2">
            <input
              type="checkbox"
              checked={useBBB}
              onChange={e => setUseBBB(e.target.checked)}
              className="thrive-checkbox"
            />
            Include Boring But Big (5x10 @ 50%)
          </label>

          {/* Cycle configuration */}
          <div className="md:col-span-2 border-t border-border pt-4 mt-2">
            <p className="text-xs uppercase tracking-wider opacity-50 mb-4">Cycle Configuration</p>
          </div>

          <label className="grid grid-cols-[2fr_3fr] gap-1 items-center md:col-span-2">
            <span>Cycle Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-input-bg font-mono"
            />
          </label>

          <label className="flex items-center md:col-span-2">
            <input
              type="checkbox"
              checked={useDeload}
              onChange={e => setUseDeload(e.target.checked)}
              className="thrive-checkbox"
            />
            Include Deload Week (4th week @ 40/50/60%)
          </label>

          {/* Day assignments */}
          {fiveThreeOneDays.length > 0 && (
            <>
              <div className="md:col-span-2 border-t border-border pt-4 mt-2">
                <p className="text-xs uppercase tracking-wider opacity-50 mb-4">Assign Lifts to Days</p>
              </div>

              {LIFTS.map(lift => (
                <label key={`assign-${lift.key}`} className="grid grid-cols-[2fr_3fr] gap-1 items-center">
                  <span>{lift.label}</span>
                  <select
                    value={dayAssignments[lift.key] || ''}
                    onChange={e => setDayAssignments(prev => ({ ...prev, [lift.key]: e.target.value }))}
                    className="w-full p-2 border border-border rounded-md bg-input-bg font-mono"
                  >
                    <option value="">Not assigned</option>
                    {fiveThreeOneDays.map(d => (
                      <option key={d} value={d}>{DAY_LABELS[d]}</option>
                    ))}
                  </select>
                </label>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-6 sm:flex-row">
          <button
            onClick={handleCalculate}
            disabled={!hasLifts}
            className="w-full border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors disabled:opacity-30"
            style={{
              color: 'color-mix(in srgb, var(--color-magenta) 40%, white)',
              borderColor: 'color-mix(in srgb, var(--color-magenta) 40%, white)',
              background: 'black',
            }}
          >
            Calculate
          </button>
        </div>

        <small className="block mt-4 opacity-50">
          This calculator runs entirely in your browser. Inputs are saved locally.
        </small>
      </div>
    )
  }

  // Results view
  const cycleLength = useDeload ? 4 : 3

  return (
    <div className="max-w-[600px] mx-auto">
      <h2 className="text-xl mb-4">5/3/1 Calculator</h2>

      <div className="flex flex-col gap-2 mb-6 sm:flex-row">
        <button
          onClick={handleEdit}
          className="border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer bg-black"
          style={{
            color: 'color-mix(in srgb, var(--color-neon-green) 40%, white)',
            borderColor: 'color-mix(in srgb, var(--color-neon-green) 40%, white)',
          }}
        >
          Edit Inputs
        </button>
        <button
          onClick={handleClear}
          className="border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer bg-black"
          style={{
            color: 'color-mix(in srgb, var(--color-orange) 40%, white)',
            borderColor: 'color-mix(in srgb, var(--color-orange) 40%, white)',
          }}
        >
          Clear Saved
        </button>
        <button
          onClick={handleCopy}
          className="border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer bg-black"
          style={{
            color: 'color-mix(in srgb, var(--color-cyan) 40%, white)',
            borderColor: 'color-mix(in srgb, var(--color-cyan) 40%, white)',
          }}
        >
          Copy Table
        </button>
      </div>

      <div ref={outputRef}>
        <h3 className="text-sm opacity-50 mb-2">
          {mode === '1rm' ? '1RM Input' : 'Training Max Input'}
        </h3>

        {currentWeekIndex !== null && (
          <p className="text-sm mb-4" style={{ color: 'var(--color-magenta)' }}>
            Current Week: {currentWeekIndex + 1} of {cycleLength} — {WEEK_LABELS[currentWeekIndex]}
          </p>
        )}

        {allWeeks.map(({ sets, label, num }) => {
          const isCurrent = currentWeekIndex !== null && currentWeekIndex === num - 1
          return (
            <WeekTable
              key={num}
              weekNum={num}
              weekLabel={label}
              sets={sets}
              weights={weights}
              useBBB={useBBB}
              calcWeight={calcWeight}
              isCurrent={isCurrent}
            />
          )
        })}
      </div>
    </div>
  )
}

function WeekTable({ weekNum, weekLabel, sets, weights, useBBB, calcWeight, isCurrent }) {
  const activeLiftCount = LIFTS.filter(l => parseFloat(weights[l.key]) > 0).length
  if (!activeLiftCount) return null

  return (
    <table
      className="w-full border-collapse mt-3 text-sm"
      style={isCurrent ? { borderLeft: '3px solid var(--color-magenta)', paddingLeft: '8px' } : undefined}
    >
      <thead>
        <tr>
          <th colSpan={3} className="text-left text-2xl py-2">
            Week {weekNum}
            {weekLabel && (
              <span className="text-sm opacity-50 ml-2 font-normal">{weekLabel}</span>
            )}
          </th>
        </tr>
        <tr className="opacity-50">
          <th className="text-left py-1 px-1">Lift</th>
          <th className="text-left py-1 px-1">Set</th>
          <th className="text-left py-1 px-1">Weight</th>
        </tr>
      </thead>
      <tbody>
        {LIFTS.map(lift => {
          const v = parseFloat(weights[lift.key]) || 0
          if (!v) return null
          const baseColor = COLOR_MAP[lift.color]
          const rows = sets.map((s, idx) => {
            const wgt = calcWeight(weights[lift.key], s.p)
            const mixPct = 20 + idx * 20
            return (
              <tr
                key={`${lift.key}-${idx}`}
                style={{
                  color: `color-mix(in srgb, ${baseColor} ${mixPct}%, white)`,
                  borderBottom: !useBBB && idx === sets.length - 1
                    ? `2px solid color-mix(in srgb, ${baseColor} 20%, black)`
                    : '1px solid #222',
                }}
              >
                <td className="py-1 px-1" style={{ color: idx === 0 ? baseColor : undefined }}>
                  {idx === 0 ? lift.key.toUpperCase() : ''}
                </td>
                <td className="py-1 px-1">{s.r} reps @ {s.p}%</td>
                <td className="py-1 px-1 font-bold text-base">{wgt}</td>
              </tr>
            )
          })

          if (useBBB) {
            const bbbWgt = calcWeight(weights[lift.key], 50)
            rows.push(
              <tr
                key={`${lift.key}-bbb`}
                style={{
                  color: 'white',
                  borderBottom: `2px solid color-mix(in srgb, ${baseColor} 20%, black)`,
                }}
              >
                <td className="py-1 px-1"></td>
                <td className="py-1 px-1">5x10 @ 50%</td>
                <td className="py-1 px-1 font-bold text-base">{bbbWgt}</td>
              </tr>
            )
          }

          return rows
        })}
      </tbody>
    </table>
  )
}
