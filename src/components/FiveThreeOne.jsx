import { useState, useEffect, useRef } from 'react'
import { useUser } from '../hooks/useUser'
import { roundToNearest } from '../utils/rounding'

const LIFTS = [
  { key: 'squat', label: 'Back Squat', color: 'magenta' },
  { key: 'bench', label: 'Bench Press', color: 'cyan' },
  { key: 'deadlift', label: 'Deadlift', color: 'neon-green' },
  { key: 'press', label: 'Overhead Press', color: 'yellow' },
]

const WEEKS = [
  [
    { p: 65, r: '5' },
    { p: 75, r: '5' },
    { p: 85, r: '5+' },
  ],
  [
    { p: 70, r: '3' },
    { p: 80, r: '3' },
    { p: 90, r: '3+' },
  ],
  [
    { p: 75, r: '5' },
    { p: 85, r: '3' },
    { p: 95, r: '1+' },
  ],
]

const COLOR_MAP = {
  magenta: 'var(--color-magenta)',
  cyan: 'var(--color-cyan)',
  'neon-green': 'var(--color-neon-green)',
  yellow: 'var(--color-yellow)',
}

export default function FiveThreeOne() {
  const { getUserData, setUserData, removeUserData } = useUser()

  const [view, setView] = useState('form') // 'form' | 'results'
  const [mode, setMode] = useState('tm')
  const [weights, setWeights] = useState({ squat: '', bench: '', deadlift: '', press: '' })
  const [useRounding, setUseRounding] = useState(true)
  const [useBBB, setUseBBB] = useState(false)
  const outputRef = useRef(null)

  // Load saved data on mount
  useEffect(() => {
    const saved = getUserData('531')
    if (saved) {
      setMode(saved.mode || 'tm')
      setWeights(saved.weights || { squat: '', bench: '', deadlift: '', press: '' })
      setUseRounding(saved.useRounding !== false)
      setUseBBB(saved.useBBB === true)
      if (Object.values(saved.weights || {}).some(v => v)) {
        setView('results')
      }
    }
  }, [getUserData])

  function save(w, m, r, b) {
    setUserData('531', { weights: w, mode: m, useRounding: r, useBBB: b })
  }

  function handleCalculate() {
    save(weights, mode, useRounding, useBBB)
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
    setView('form')
  }

  function handleCopy() {
    if (outputRef.current) {
      navigator.clipboard.writeText(outputRef.current.innerText)
    }
  }

  function calcWeight(value, pct) {
    const v = parseFloat(value) || 0
    if (!v) return null
    const tm = mode === '1rm' ? v * 0.9 : v
    const raw = tm * pct / 100
    return useRounding ? roundToNearest(raw, 5) : raw.toFixed(1)
  }

  const hasLifts = Object.values(weights).some(v => parseFloat(v) > 0)

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
        <h3 className="text-sm opacity-50 mb-4">
          {mode === '1rm' ? '1RM Input' : 'Training Max Input'}
        </h3>

        {WEEKS.map((week, weekIdx) => (
          <WeekTable
            key={weekIdx}
            weekNum={weekIdx + 1}
            sets={week}
            weights={weights}
            useBBB={useBBB}
            calcWeight={calcWeight}
          />
        ))}
      </div>
    </div>
  )
}

function WeekTable({ weekNum, sets, weights, useBBB, calcWeight }) {
  const activeLiftCount = LIFTS.filter(l => parseFloat(weights[l.key]) > 0).length
  if (!activeLiftCount) return null

  return (
    <table className="w-full border-collapse mt-3 text-sm">
      <thead>
        <tr>
          <th colSpan={3} className="text-left text-2xl py-2">Week {weekNum}</th>
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
            const mixPct = 20 + idx * 20 // 20%, 40%, 60%
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
