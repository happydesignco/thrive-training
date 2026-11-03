import { useState, useMemo, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { calcWeight, COLOR_MAP, LIFTS } from '../utils/fiveThreeOne'
import { itemKey, e1rm, serializeSession, parseSession } from '../utils/session'

const BLOCK_COLORS = [
  'var(--color-magenta)',
  'var(--color-cyan)',
  'var(--color-neon-green)',
  'var(--color-yellow)',
  'var(--color-orange)',
]

const inputClass =
  'px-2 py-1 text-xs bg-black border border-border rounded font-mono focus:border-magenta focus:outline-none'

// Text input that only saves on blur, so typing doesn't sync every keystroke.
function LogInput({ value, onCommit, className = '', ...props }) {
  const [local, setLocal] = useState(value ?? '')
  useEffect(() => { setLocal(value ?? '') }, [value])
  return (
    <input
      {...props}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== (value ?? '')) onCommit(local) }}
      onClick={e => e.stopPropagation()}
      className={`${inputClass} ${className}`}
    />
  )
}

// Most recent logged weight for each exercise before `date`.
function useLastWeights(date) {
  const { currentUser } = useUser()
  return useMemo(() => {
    const prefix = `thrive:user:${currentUser.id}:log:`
    const dates = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(prefix)) {
        const d = k.slice(prefix.length)
        if (d < date) dates.push(d)
      }
    }
    dates.sort().reverse()
    const last = {}
    for (const d of dates) {
      try {
        const log = JSON.parse(localStorage.getItem(prefix + d))
        for (const [key, entry] of Object.entries(log?.items || {})) {
          if (entry?.w && !last[key]) last[key] = entry.w
        }
      } catch { /* skip bad rows */ }
    }
    return last
  }, [currentUser.id, date])
}

function LiftItem({ item, lift531, log, updateItem, onPlate }) {
  const lift = LIFTS.find(l => l.key === item.lift)
  const color = COLOR_MAP[lift?.color] || 'white'
  const tm = lift531?.weights?.[item.lift]
  const hasWeight = parseFloat(tm) > 0
  const key = itemKey(item)
  const entry = log.items?.[key] || {}

  if (!lift531?.configured || !hasWeight) {
    return (
      <li className="text-xs">
        <span className="font-bold" style={{ color }}>{item.text}</span>
        <span className="opacity-50 ml-2">Set your {lift?.label || 'lift'} max in the 5/3/1 tab</span>
      </li>
    )
  }

  const sets = lift531.sets
  const topWeight = calcWeight(tm, sets[sets.length - 1].p, lift531.mode, lift531.useRounding)
  const isAmrap = String(sets[sets.length - 1].r).endsWith('+')
  const est = isAmrap ? e1rm(topWeight, entry.amrap) : null

  return (
    <li className="flex flex-col gap-1">
      <p className="text-xs uppercase tracking-wider font-bold" style={{ color }}>
        {lift.label} <span className="opacity-50 normal-case tracking-normal font-normal">{lift531.weekLabel}</span>
      </p>
      <ul className="list-none pl-3" style={{ borderLeft: `2px solid ${color}` }}>
        {sets.map((s, idx) => {
          const wgt = calcWeight(tm, s.p, lift531.mode, lift531.useRounding)
          const last = idx === sets.length - 1
          return (
            <li key={idx} className="mb-1 text-xs flex items-center justify-between max-w-[300px] gap-2">
              <span>{s.r} @ {s.p}%</span>
              <span className="flex items-center gap-2">
                {last && isAmrap && (
                  <LogInput
                    value={entry.amrap}
                    onCommit={v => updateItem(key, { amrap: v, w: String(topWeight) })}
                    inputMode="numeric"
                    placeholder="reps"
                    className="w-14 text-center"
                  />
                )}
                <span
                  className="font-bold text-sm underline cursor-pointer"
                  onClick={e => { e.stopPropagation(); onPlate(Number(wgt)) }}
                >{wgt}</span>
              </span>
            </li>
          )
        })}
      </ul>
      {est && <p className="text-[10px] opacity-60 pl-3">Est. 1RM {est}</p>}
    </li>
  )
}

function AccessoryItem({ item, log, updateItem, lastWeight }) {
  const key = itemKey(item)
  const entry = log.items?.[key] || {}
  const loggable = !!item.sets
  return (
    <li className="text-xs flex items-center justify-between gap-2 py-0.5">
      <label className="flex items-center min-w-0 cursor-pointer" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          className="thrive-checkbox shrink-0"
          checked={!!entry.done}
          onChange={e => updateItem(key, { done: e.target.checked })}
        />
        <span className={entry.done ? 'opacity-50' : ''}>{item.text}</span>
      </label>
      {loggable && (
        <span className="flex items-center gap-1 shrink-0">
          <LogInput
            value={entry.w}
            onCommit={v => updateItem(key, { w: v })}
            inputMode="decimal"
            placeholder={lastWeight ? String(lastWeight) : 'lbs'}
            className="w-16 text-center"
          />
        </span>
      )}
    </li>
  )
}

export function SessionEditor({ initialText, onSave, onCancel, onShuffle, groupOption }) {
  const [text, setText] = useState(initialText || '')
  const [toGroup, setToGroup] = useState(true)
  useEffect(() => { setText(initialText || '') }, [initialText])
  return (
    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={Math.max(8, text.split('\n').length + 1)}
        placeholder={'Squat 531\nChin ups 3x10\n\nBench 531\nSplit squat 3x8 each leg\n\nDips 3x10'}
        className={`${inputClass} w-full text-sm leading-relaxed`}
      />
      <p className="text-[10px] opacity-50">
        Blank line between pairs. "Squat 531" pulls in your 5/3/1 sets.
      </p>
      {groupOption && (
        <label className="text-xs flex items-center">
          <input
            type="checkbox"
            className="thrive-checkbox"
            checked={toGroup}
            onChange={e => setToGroup(e.target.checked)}
          />
          Post for the group
        </label>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => { const s = parseSession(text); if (s) onSave(s, groupOption && toGroup) }}
          disabled={!text.trim()}
          className="px-3 py-1.5 text-xs bg-magenta text-black rounded font-bold disabled:opacity-30"
        >
          Save
        </button>
        {onShuffle && (
          <button
            onClick={() => setText(onShuffle())}
            className="px-3 py-1.5 text-xs border border-border rounded hover:border-white"
          >
            Shuffle pairings
          </button>
        )}
        <button onClick={onCancel} className="px-3 py-1.5 text-xs opacity-50 hover:opacity-100">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function SessionView({ session, date, lift531, onPlate }) {
  const { getUserData, setUserData } = useUser()
  const logKey = `log:${date}`
  const [log, setLog] = useState(() => getUserData(logKey) || {})
  const lastWeights = useLastWeights(date)

  useEffect(() => { setLog(getUserData(logKey) || {}) }, [logKey, getUserData])

  function commit(next) {
    setLog(next)
    setUserData(logKey, next)
  }

  function updateItem(key, patch) {
    const items = { ...(log.items || {}) }
    items[key] = { ...(items[key] || {}), ...patch }
    commit({ ...log, items })
  }

  const isLift = session.kind === 'lift'

  return (
    <div className="flex flex-col gap-3">
      {session.blocks.map((block, bIdx) => {
        const color = BLOCK_COLORS[bIdx % BLOCK_COLORS.length]
        const isLast = bIdx === session.blocks.length - 1 && bIdx > 1
        const isPair = isLift && block.items.length === 2 && !isLast
        return (
          <div key={bIdx} className="flex flex-col gap-1">
            {isLift && (
              <p className="text-[10px] uppercase tracking-wider opacity-50">
                {isPair ? `Pair ${String.fromCharCode(65 + bIdx)} · alternate, 3 rounds` :
                  isLast ? 'Finisher' : `Block ${bIdx + 1}`}
              </p>
            )}
            <ul className="list-none pl-3 flex flex-col gap-1" style={{ borderLeft: `2px solid ${color}` }}>
              {block.items.map((item, iIdx) => item.lift ? (
                <LiftItem key={iIdx} item={item} lift531={lift531} log={log} updateItem={updateItem} onPlate={onPlate} />
              ) : isLift ? (
                <AccessoryItem key={iIdx} item={item} log={log} updateItem={updateItem} lastWeight={lastWeights[itemKey(item)]} />
              ) : (
                <li key={iIdx} className="text-xs">{item.text}</li>
              ))}
            </ul>
          </div>
        )
      })}

      <div className="flex flex-col gap-2 border-t border-border pt-3" onClick={e => e.stopPropagation()}>
        {!isLift && (
          <label className="flex items-center gap-2 text-xs">
            <span className="opacity-50 w-14 shrink-0">Result</span>
            <LogInput
              value={log.result}
              onCommit={v => commit({ ...log, result: v })}
              placeholder={session.kind === 'run' ? 'e.g. 3.1 mi, 28:40' : 'rounds, time, or reps'}
              className="flex-1"
            />
          </label>
        )}
        <label className="flex items-center gap-2 text-xs">
          <span className="opacity-50 w-14 shrink-0">Notes</span>
          <LogInput
            value={log.notes}
            onCommit={v => commit({ ...log, notes: v })}
            placeholder="How it felt, subs, etc."
            className="flex-1"
          />
        </label>
      </div>
    </div>
  )
}

export { serializeSession }
