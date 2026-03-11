import { useState, useEffect, useRef, useCallback } from 'react'
import { sessions } from '../data/mobilityData'

const COLORS = {
  magenta: '#FF00FF',
  cyan: '#00FFFF',
  green: '#39FF14',
  yellow: '#FFFF00',
  orange: '#FF4500',
}

const PHASE_COLORS = {
  morning: [COLORS.magenta, COLORS.cyan, COLORS.green],
  evening: [COLORS.cyan, COLORS.green, COLORS.yellow],
}

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function playComplete() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[[440, 0], [554, 0.18]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, ctx.currentTime + delay)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.6)
    })
  } catch (e) { /* silent */ }
}

function buildExerciseList(session) {
  const arr = []
  sessions[session].forEach((phase, pi) => {
    phase.exercises.forEach((ex, ei) => {
      arr.push({ phaseIndex: pi, exIndex: ei, done: false, sidesDone: 0 })
    })
  })
  return arr
}

export default function Mobility() {
  const [currentSession, setCurrentSession] = useState('morning')
  const [exState, setExState] = useState(() => ({
    morning: buildExerciseList('morning'),
    evening: buildExerciseList('evening'),
  }))
  const [activeCard, setActiveCard] = useState(0)
  const [timerLeft, setTimerLeft] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)
  const [timerIndex, setTimerIndex] = useState(null)
  const [flashing, setFlashing] = useState(false)
  const [pulsing, setPulsing] = useState(false)

  const intervalRef = useRef(null)
  const timerLeftRef = useRef(0)
  const timerIndexRef = useRef(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerRunning(false)
    setTimerPaused(false)
    setTimerIndex(null)
    timerIndexRef.current = null
  }, [])

  // Shared tick interval — session is captured at start so side advancement works
  const startInterval = useCallback((index, session) => {
    intervalRef.current = setInterval(() => {
      timerLeftRef.current -= 1
      const newLeft = timerLeftRef.current
      setTimerLeft(newLeft)

      if (newLeft <= 3 && newLeft > 0) {
        setFlashing(true)
        setTimeout(() => setFlashing(false), 350)
        setPulsing(true)
        setTimeout(() => setPulsing(false), 400)
      }

      if (newLeft <= 0) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setTimerRunning(false)
        setTimerPaused(false)
        setTimerIndex(null)
        timerIndexRef.current = null
        playComplete()
        setFlashing(true)
        setTimeout(() => setFlashing(false), 350)

        // Advance sides
        setExState(prev => {
          const next = { ...prev }
          const arr = [...next[session]]
          const s = arr[index]
          const ex = sessions[session][s.phaseIndex].exercises[s.exIndex]

          if (ex.sides && s.sidesDone < 2) {
            arr[index] = { ...s, sidesDone: s.sidesDone + 1 }
            next[session] = arr
          }
          return next
        })

        setTimerLeft(0)
        timerLeftRef.current = 0
      }
    }, 1000)
  }, [])

  const switchSession = useCallback((session) => {
    stopTimer()
    setTimerLeft(0)
    timerLeftRef.current = 0
    setCurrentSession(session)
    setActiveCard(0)
  }, [stopTimer])

  const markDone = useCallback((index) => {
    if (timerIndexRef.current === index) {
      stopTimer()
      setTimerLeft(0)
      timerLeftRef.current = 0
    }

    setExState(prev => {
      const next = { ...prev }
      const arr = [...next[currentSession]]
      arr[index] = { ...arr[index], done: true }
      next[currentSession] = arr

      const allDone = arr.every(e => e.done)
      if (allDone) playComplete()

      const nextUndone = arr.findIndex((e, i) => i > index && !e.done)
      if (nextUndone !== -1) {
        setTimeout(() => setActiveCard(nextUndone), 100)
      }

      return next
    })
  }, [currentSession, stopTimer])

  const doStart = useCallback((index, duration, session) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setTimerIndex(index)
    timerIndexRef.current = index
    setTimerLeft(duration)
    timerLeftRef.current = duration
    setTimerRunning(true)
    setTimerPaused(false)
    setActiveCard(index)

    startInterval(index, session)
  }, [startInterval])

  const doPause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setTimerRunning(false)
    setTimerPaused(true)
  }, [])

  const doResume = useCallback((index, session) => {
    setTimerRunning(true)
    setTimerPaused(false)
    setTimerIndex(index)
    timerIndexRef.current = index
    setActiveCard(index)

    startInterval(index, session)
  }, [startInterval])

  const doRestart = useCallback((index, duration, session) => {
    doStart(index, duration, session)
  }, [doStart])

  const resetSession = useCallback(() => {
    stopTimer()
    setTimerLeft(0)
    timerLeftRef.current = 0
    setExState(prev => ({
      ...prev,
      [currentSession]: buildExerciseList(currentSession),
    }))
    setActiveCard(0)
  }, [currentSession, stopTimer])

  const toggleCard = (index) => {
    setActiveCard(prev => prev === index ? null : index)
  }

  const currentExState = exState[currentSession]
  const routine = sessions[currentSession]
  const doneCount = currentExState.filter(e => e.done).length
  const totalCount = currentExState.length
  const allDone = currentExState.every(e => e.done)
  const progressPct = totalCount > 0 ? (doneCount / totalCount) * 100 : 0
  const sessionColor = currentSession === 'morning' ? COLORS.magenta : COLORS.cyan
  const completeColor = currentSession === 'morning' ? COLORS.green : COLORS.yellow

  let globalIndex = 0

  return (
    <div className="max-w-[540px] mx-auto">
      {/* Flash overlay */}
      {flashing && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: 'white',
            animation: 'screenFlash 0.35s ease-out forwards',
          }}
        />
      )}

      {/* Session tabs */}
      <div className="grid grid-cols-2 gap-2 mb-6 pb-4 border-b border-border">
        <button
          onClick={() => switchSession('morning')}
          className="font-mono text-[0.7rem] tracking-[0.12em] uppercase py-2.5 px-4 border transition-all"
          style={{
            borderColor: currentSession === 'morning' ? COLORS.magenta : 'var(--color-border)',
            color: currentSession === 'morning' ? COLORS.magenta : '#555',
            background: currentSession === 'morning'
              ? `color-mix(in srgb, ${COLORS.magenta} 5%, black)`
              : 'transparent',
          }}
        >
          Morning
          <span className="block text-[0.6rem] opacity-50 mt-0.5 tracking-[0.08em]">
            Release · Activate · Integrate
          </span>
        </button>
        <button
          onClick={() => switchSession('evening')}
          className="font-mono text-[0.7rem] tracking-[0.12em] uppercase py-2.5 px-4 border transition-all"
          style={{
            borderColor: currentSession === 'evening' ? COLORS.cyan : 'var(--color-border)',
            color: currentSession === 'evening' ? COLORS.cyan : '#555',
            background: currentSession === 'evening'
              ? `color-mix(in srgb, ${COLORS.cyan} 5%, black)`
              : 'transparent',
          }}
        >
          Evening
          <span className="block text-[0.6rem] opacity-50 mt-0.5 tracking-[0.08em]">
            Decompress · Mobilize · Restore
          </span>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[0.7rem] opacity-40 tracking-[0.1em] uppercase mb-1">
          <span>
            {currentSession === 'morning' ? 'Morning · ~20 min' : 'Evening · ~25 min'}
          </span>
          <span>{doneCount} / {totalCount}</span>
        </div>
        <div className="h-[2px] w-full" style={{ background: 'var(--color-border)' }}>
          <div
            className="h-full transition-all duration-400"
            style={{
              width: `${progressPct}%`,
              background: sessionColor,
            }}
          />
        </div>
      </div>

      {/* Phases and exercises */}
      {routine.map((phase, pi) => {
        const phaseColor = PHASE_COLORS[currentSession][pi]

        return (
          <div key={phase.phaseKey}>
            {/* Phase label */}
            <div
              className="text-[0.65rem] tracking-[0.2em] uppercase opacity-50 mt-6 mb-3 font-medium"
              style={{ color: phaseColor }}
            >
              Phase {pi + 1} — {phase.phase}
            </div>

            {/* Exercise cards */}
            {phase.exercises.map((ex, ei) => {
              const gi = globalIndex++
              const s = currentExState[gi]
              const isActive = activeCard === gi
              const isDone = s.done
              const isSided = ex.sides === true
              const side1Done = s.sidesDone >= 1
              const side2Done = s.sidesDone >= 2
              const isThisRunning = timerRunning && timerIndex === gi
              const isThisPaused = timerPaused && timerIndex === gi

              const displayTime = (isThisRunning || isThisPaused)
                ? formatTime(timerLeft)
                : ex.duration ? formatTime(ex.duration) : null

              let startLabel = 'Start Timer'
              if (isSided) {
                startLabel = !side1Done ? 'Start — Left Side' : 'Start — Right Side'
              }

              return (
                <div
                  key={gi}
                  className="mb-2 relative overflow-hidden cursor-pointer transition-all duration-200"
                  style={{
                    border: `1px solid ${isActive ? phaseColor : 'var(--color-border)'}`,
                    background: isActive ? '#151515' : 'var(--color-card-bg)',
                    opacity: isDone ? 0.3 : 1,
                  }}
                  onClick={(e) => {
                    if (e.target.tagName === 'BUTTON') return
                    toggleCard(gi)
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[2px] transition-opacity duration-200"
                    style={{
                      background: phaseColor,
                      opacity: isActive ? 1 : 0,
                    }}
                  />

                  <div className="p-4">
                    {/* Card top */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="text-base font-medium leading-tight">{ex.name}</div>
                        <div className="text-[0.7rem] opacity-50 mt-1 tracking-[0.05em]">{ex.meta}</div>
                      </div>
                      <div
                        className="text-[0.75rem] tracking-[0.1em] uppercase whitespace-nowrap shrink-0 transition-opacity duration-200"
                        style={{
                          color: isDone ? 'white' : phaseColor,
                          opacity: isActive ? 1 : isDone ? 0.4 : 0,
                        }}
                      >
                        {isDone ? '✓ done' : '→ active'}
                      </div>
                    </div>

                    {/* Card detail (accordion) */}
                    <div
                      className="overflow-hidden transition-all duration-300"
                      style={{
                        maxHeight: isActive ? '480px' : '0px',
                        marginTop: isActive ? '1rem' : '0',
                      }}
                    >
                      {/* Cue text */}
                      <p
                        className="text-[0.8rem] leading-relaxed opacity-70 mb-3 pl-3"
                        style={{ borderLeft: '1px solid var(--color-border)' }}
                      >
                        {ex.cue}
                      </p>

                      {/* Timer section */}
                      {ex.duration && (
                        <div className="mt-3">
                          {/* Side indicator or timer label */}
                          {isSided ? (
                            <div className="flex items-center gap-2 text-[0.65rem] tracking-[0.15em] uppercase mb-1">
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block transition-colors duration-200"
                                style={{
                                  background: side1Done ? '#555' : phaseColor,
                                }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full inline-block transition-colors duration-200"
                                style={{
                                  background: side1Done && !side2Done
                                    ? phaseColor
                                    : side2Done ? '#555' : '#333',
                                }}
                              />
                              <span
                                style={{
                                  opacity: (!side1Done || (side1Done && !side2Done)) ? 1 : 0.5,
                                  color: (!side1Done || (side1Done && !side2Done)) ? phaseColor : 'inherit',
                                }}
                              >
                                {!side1Done ? 'Left Side' : !side2Done ? 'Right Side' : 'Both Done'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-[0.65rem] opacity-40 tracking-[0.15em] uppercase mb-1">
                              Timer
                            </div>
                          )}

                          {/* Timer display */}
                          <div
                            className={`text-[2.5rem] font-light tracking-[0.05em] leading-none ${pulsing && (isThisRunning || isThisPaused) ? 'scale-110' : ''} transition-transform duration-400`}
                            style={{ color: phaseColor }}
                          >
                            {displayTime}
                          </div>
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {ex.duration && (
                          <>
                            {isThisRunning ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); doPause() }}
                                  className="font-mono text-[0.7rem] tracking-[0.1em] uppercase py-2 px-3 bg-black cursor-pointer transition-colors"
                                  style={{ border: `1px solid ${COLORS.yellow}`, color: COLORS.yellow }}
                                >
                                  Pause
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); doRestart(gi, ex.duration, currentSession) }}
                                  className="font-mono text-[0.7rem] tracking-[0.1em] uppercase py-2 px-3 bg-black cursor-pointer transition-colors border-[#444] text-[#888]"
                                  style={{ border: '1px solid #444' }}
                                >
                                  Restart
                                </button>
                              </>
                            ) : isThisPaused ? (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); doResume(gi, currentSession) }}
                                  className="font-mono text-[0.7rem] tracking-[0.1em] uppercase py-2 px-3 bg-black cursor-pointer transition-colors"
                                  style={{ border: `1px solid ${phaseColor}`, color: phaseColor }}
                                >
                                  Resume
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); doRestart(gi, ex.duration, currentSession) }}
                                  className="font-mono text-[0.7rem] tracking-[0.1em] uppercase py-2 px-3 bg-black cursor-pointer transition-colors"
                                  style={{ border: '1px solid #444', color: '#888' }}
                                >
                                  Restart
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  doStart(gi, ex.duration, currentSession)
                                }}
                                className="font-mono text-[0.7rem] tracking-[0.1em] uppercase py-2 px-3 bg-black cursor-pointer transition-colors"
                                style={{ border: `1px solid ${phaseColor}`, color: phaseColor }}
                              >
                                {startLabel}
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); markDone(gi) }}
                          className="font-mono text-[0.7rem] tracking-[0.1em] uppercase py-2 px-3 bg-black cursor-pointer transition-colors hover:border-white hover:text-white"
                          style={{ border: '1px solid #333', color: 'white' }}
                        >
                          Mark Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Completion banner */}
      {allDone && (
        <div
          className="text-center py-8 px-4 mt-6"
          style={{ border: `1px solid ${completeColor}` }}
        >
          <h2
            className="text-xl tracking-[0.1em] mb-2"
            style={{ color: completeColor }}
          >
            Session Complete
          </h2>
          <p className="opacity-40 text-[0.75rem] tracking-[0.1em] uppercase">
            {currentSession === 'morning' ? 'Well done · See you tonight' : 'Good night · Rest well'}
          </p>
        </div>
      )}

      {/* Reset button */}
      <button
        onClick={resetSession}
        className="block w-full mt-6 py-3 font-mono text-[0.7rem] tracking-[0.15em] uppercase bg-black text-center cursor-pointer transition-colors text-[#333] hover:text-[#FF4500] border border-[#1a1a1a] hover:border-[#FF4500]"
      >
        Reset Session
      </button>

      {/* Flash animation keyframes */}
      <style>{`
        @keyframes screenFlash {
          0% { opacity: 0.18; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
