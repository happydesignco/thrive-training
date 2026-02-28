import { useState, useEffect } from 'react'

const PLATES = [45, 25, 15, 10, 5, 2.5]
const BAR_OPTIONS = [45, 35, 15]
const STORAGE_KEY = 'thrive:bar-weight'

const PLATE_COLORS = {
  45: '#3B82F6',  // blue
  25: '#22C55E',  // green
  15: '#555555',  // dark gray (Rogue bumper)
  10: '#444444',  // darker gray (Rogue bumper)
  5: '#9CA3AF',   // gray
  2.5: '#6B7280', // darker gray
}

const BUMPER_PLATES = new Set([45, 25, 15, 10])

const PLATE_WIDTHS = { 45: 14, 25: 12, 15: 10, 10: 8, 5: 8, 2.5: 6 }

function calcPlates(targetWeight, barWeight) {
  if (targetWeight < barWeight) return null
  if (targetWeight === barWeight) return []

  let perSide = (targetWeight - barWeight) / 2
  const result = []

  for (const plate of PLATES) {
    while (perSide >= plate - 0.01) {
      result.push(plate)
      perSide -= plate
    }
  }

  if (perSide > 0.01) return null
  return result
}

function roundToPlateWeight(rawWeight, barWeight) {
  // Smallest plate increment per side is 2.5, so total increments of 5
  if (rawWeight <= barWeight) return barWeight
  const above = rawWeight - barWeight
  const rounded = Math.round(above / 5) * 5
  return barWeight + rounded
}

function formatPlateList(plates) {
  if (!plates || plates.length === 0) return ''
  const counts = {}
  plates.forEach(p => { counts[p] = (counts[p] || 0) + 1 })
  return Object.entries(counts)
    .map(([weight, count]) => `${count}\u00D7${weight}`)
    .join(' + ') + ' each side'
}

function BarDiagram({ plates, barWeight }) {
  const svgWidth = 340
  const svgHeight = 100
  const barY = svgHeight / 2
  const barHeight = 10
  const collarWidth = 8
  const barStartX = 10
  const sleeveStartX = barStartX + 60

  const bumperHeight = 64
  const changeHeight = 40
  const plateGap = 2

  let x = sleeveStartX + collarWidth + 2

  const plateRects = plates.map((weight, i) => {
    const isBumper = BUMPER_PLATES.has(weight)
    const h = isBumper ? bumperHeight : changeHeight
    const w = PLATE_WIDTHS[weight] || 10
    const rect = {
      x, y: barY - h / 2, width: w, height: h,
      color: PLATE_COLORS[weight], weight, key: i,
    }
    x += w + plateGap
    return rect
  })

  const totalWidth = Math.max(x + 20, svgWidth)

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${svgHeight}`}
      className="w-full"
      style={{ maxHeight: '120px' }}
    >
      {/* Bar shaft */}
      <rect
        x={barStartX} y={barY - barHeight / 2}
        width={x - barStartX + 10} height={barHeight}
        rx={2} fill="#71717A"
      />
      {/* Collar */}
      <rect
        x={sleeveStartX} y={barY - 16 / 2}
        width={collarWidth} height={16}
        rx={1} fill="#A1A1AA"
      />
      {/* Plates */}
      {plateRects.map(r => {
        const isChange = !BUMPER_PLATES.has(r.weight)
        const labelY = isChange ? barY + changeHeight / 2 + 10 : barY + bumperHeight / 2 + 12
        const labelSize = r.weight === 2.5 ? '7' : '9'
        return (
          <g key={r.key}>
            <rect
              x={r.x} y={r.y} width={r.width} height={r.height}
              rx={2} fill={r.color}
            />
            <text
              x={r.x + r.width / 2} y={labelY}
              textAnchor="middle" fontSize={labelSize} fill="#ccc" fontFamily="monospace"
            >
              {r.weight}
            </text>
          </g>
        )
      })}
      {/* Bar weight label */}
      <text
        x={barStartX + 30} y={barY - barHeight / 2 - 6}
        textAnchor="middle" fontSize="10" fill="#999" fontFamily="monospace"
      >
        {barWeight}lb bar
      </text>
      {/* "each side" label */}
      {plates.length > 0 && (
        <text
          x={x + 24} y={barY + 4}
          fontSize="9" fill="#666" fontFamily="monospace"
        >
          each side
        </text>
      )}
    </svg>
  )
}

export default function PlateCalculator({ weight, onClose }) {
  const [barWeight, setBarWeight] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Number(saved) : 45
  })

  const [quickWeight, setQuickWeight] = useState('')
  const [quickPct, setQuickPct] = useState('100')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger slide-up animation on next frame
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(barWeight))
  }, [barWeight])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const quickExact = quickWeight && quickPct
    ? parseFloat(quickWeight) * parseFloat(quickPct) / 100
    : null
  const quickRounded = quickExact !== null
    ? roundToPlateWeight(Math.round(quickExact), barWeight)
    : null
  const quickShowsBoth = quickExact !== null && quickRounded !== Math.round(quickExact)

  const plates = weight ? calcPlates(Number(weight), barWeight) : null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-200"
        style={{ opacity: visible ? 0.6 : 0 }}
      />

      {/* Drawer */}
      <div
        className="relative bg-card-bg border-t border-border rounded-t-xl max-h-[85vh] overflow-y-auto transition-transform duration-200"
        style={{ transform: visible ? 'translateY(0)' : 'translateY(100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-4 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider">Plate Calculator</h3>
            <button onClick={handleClose} className="text-xs opacity-50 hover:opacity-100 px-2 py-1">
              Close
            </button>
          </div>

          {/* Bar weight toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs opacity-50 uppercase tracking-wider">Bar:</span>
            {BAR_OPTIONS.map(bw => (
              <button
                key={bw}
                onClick={() => setBarWeight(bw)}
                className="text-xs font-mono px-3 py-1.5 border rounded transition-colors"
                style={{
                  borderColor: barWeight === bw ? 'var(--color-magenta)' : 'var(--color-border)',
                  color: barWeight === bw ? 'var(--color-magenta)' : undefined,
                  opacity: barWeight === bw ? 1 : 0.5,
                }}
              >
                {bw} lb
              </button>
            ))}
          </div>

          {/* Pre-set weight display */}
          {weight && (
            <div className="mb-4">
              <p className="text-xs opacity-50 uppercase tracking-wider mb-1">Target Weight</p>
              <p className="text-2xl font-bold font-mono">{weight} lb</p>
            </div>
          )}

          {/* Plate diagram + breakdown for preset weight */}
          {weight && plates !== null && (
            <div className="mb-4">
              <BarDiagram plates={plates} barWeight={barWeight} />
              {plates.length > 0 && (
                <p className="text-xs opacity-70 font-mono mt-2 text-center">
                  {formatPlateList(plates)}
                </p>
              )}
              {plates.length === 0 && (
                <p className="text-xs opacity-50 mt-2 text-center">Empty bar — no plates needed</p>
              )}
            </div>
          )}

          {weight && plates === null && (
            <div className="mb-4 text-center py-4">
              <p className="text-sm opacity-50">
                {Number(weight) < barWeight
                  ? `Weight is less than the ${barWeight} lb bar`
                  : 'Cannot be made with standard plates'}
              </p>
            </div>
          )}

          {/* Quick calc section */}
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-xs opacity-50 uppercase tracking-wider mb-3">Quick Calc</p>
            <div className="flex gap-2 items-end">
              <label className="flex-1">
                <span className="text-[10px] opacity-50 uppercase block mb-1">Weight</span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 315"
                  value={quickWeight}
                  onChange={e => setQuickWeight(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-input-bg font-mono text-sm"
                />
              </label>
              <span className="text-xs opacity-30 pb-2.5">&times;</span>
              <label className="flex-1">
                <span className="text-[10px] opacity-50 uppercase block mb-1">%</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                  value={quickPct}
                  onChange={e => setQuickPct(e.target.value)}
                  className="w-full p-2 border border-border rounded-md bg-input-bg font-mono text-sm"
                />
              </label>
              <span className="text-xs opacity-30 pb-2.5">=</span>
              <div className="flex-1">
                <span className="text-[10px] opacity-50 uppercase block mb-1">Result</span>
                <div className="p-2 border border-border rounded-md bg-input-bg font-mono text-sm font-bold" style={{ minHeight: '38px' }}>
                  {quickRounded ?? '—'}
                  {quickShowsBoth && (
                    <span className="text-[10px] opacity-40 font-normal ml-1">({Math.round(quickExact)})</span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick calc plate diagram */}
            {quickRounded && (() => {
              const qPlates = calcPlates(quickRounded, barWeight)
              if (qPlates === null) {
                return (
                  <p className="text-xs opacity-50 mt-3 text-center">
                    {quickRounded < barWeight
                      ? `Result is less than the ${barWeight} lb bar`
                      : 'Cannot be made with standard plates'}
                  </p>
                )
              }
              return (
                <div className="mt-3">
                  <BarDiagram plates={qPlates} barWeight={barWeight} />
                  {qPlates.length > 0 && (
                    <p className="text-xs opacity-70 font-mono mt-2 text-center">
                      {formatPlateList(qPlates)}
                    </p>
                  )}
                  {qPlates.length === 0 && (
                    <p className="text-xs opacity-50 mt-2 text-center">Empty bar — no plates needed</p>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlateCalculatorButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-40 text-xs font-mono px-3 py-2 border rounded-full bg-card-bg transition-colors"
      style={{
        borderColor: 'var(--color-border)',
        color: 'var(--color-magenta)',
      }}
    >
      Plates
    </button>
  )
}
