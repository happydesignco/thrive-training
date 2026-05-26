import { useState } from 'react'

export default function PinPad({ length = 4, onSubmit, label = 'Enter PIN' }) {
  const [pin, setPin] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  function press(d) {
    if (busy) return
    setErr(null)
    if (d === 'del') return setPin((p) => p.slice(0, -1))
    if (pin.length >= 6) return
    const next = pin + d
    setPin(next)
    if (next.length >= length) {
      setBusy(true)
      Promise.resolve(onSubmit(next))
        .then((ok) => {
          if (!ok) {
            setErr('Wrong PIN — try again')
            setPin('')
          }
        })
        .catch((e) => setErr(e.message ?? String(e)))
        .finally(() => setBusy(false))
    }
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="text-center mb-3 opacity-70 text-sm">{label}</div>
      <div className="flex justify-center gap-3 mb-4">
        {Array.from({ length: Math.max(length, pin.length) }).map((_, i) => (
          <span key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''}`} />
        ))}
      </div>
      {err && <div className="text-center text-sm text-[var(--coral)] mb-2">{err}</div>}
      <div className="grid grid-cols-3 gap-2">
        {['1','2','3','4','5','6','7','8','9'].map((d) => (
          <button key={d} type="button" className="pin-key" onClick={() => press(d)}>{d}</button>
        ))}
        <span />
        <button type="button" className="pin-key" onClick={() => press('0')}>0</button>
        <button type="button" className="pin-key" onClick={() => press('del')} aria-label="delete">←</button>
      </div>
    </div>
  )
}
