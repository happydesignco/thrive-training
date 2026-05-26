import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { hashPin, isValidPin } from '../lib/pin.js'
import KidAvatar from '../components/KidAvatar.jsx'

const PALETTE = ['#facc15', '#34d399', '#fb7185', '#a78bfa', '#38bdf8', '#fb923c', '#f472b6', '#84cc16']

export default function KidsManage() {
  const { family, kids, reload } = useFamily()
  const [adding, setAdding] = useState(false)
  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Kids</h1>
        <button className="btn" onClick={() => setAdding(true)}>+ Add kid</button>
      </header>

      {kids.length === 0 && <div className="panel p-4 opacity-70">No kids yet. Add one to start.</div>}

      <ul className="space-y-3">
        {kids.map((k) => <KidRow key={k.id} kid={k} onChanged={reload} />)}
      </ul>

      {adding && <KidDialog familyId={family.id} onClose={() => setAdding(false)} onSaved={reload} />}
    </div>
  )
}

function KidRow({ kid, onChanged }) {
  const [editing, setEditing] = useState(false)
  async function archive() {
    if (!confirm(`Archive ${kid.name}? Their history is kept but they're hidden.`)) return
    const { error } = await supabase.from('kids').update({ archived: true }).eq('id', kid.id)
    if (error) { alert(error.message); return }
    onChanged()
  }
  return (
    <li className="panel p-4 flex items-center gap-4">
      <KidAvatar kid={kid} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{kid.name}</div>
        <div className="text-xs opacity-60">{kid.birth_year ? `Born ${kid.birth_year}` : 'PIN-gated'}</div>
      </div>
      <button className="btn-secondary btn text-sm" onClick={() => setEditing(true)}>Edit</button>
      <button className="btn-ghost btn text-sm" onClick={archive}>Archive</button>
      {editing && <KidDialog kid={kid} onClose={() => setEditing(false)} onSaved={onChanged} />}
    </li>
  )
}

function KidDialog({ kid, familyId, onClose, onSaved }) {
  const [name, setName] = useState(kid?.name ?? '')
  const [pin, setPin] = useState('')
  const [color, setColor] = useState(kid?.avatar_color ?? PALETTE[0])
  const [birthYear, setBirthYear] = useState(kid?.birth_year ?? '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function save(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    try {
      if (pin && !isValidPin(pin)) throw new Error('PIN must be 4–6 digits')
      const payload = {
        name: name.trim(),
        avatar_color: color,
        birth_year: birthYear ? Number(birthYear) : null,
      }
      if (pin) payload.pin_hash = await hashPin(pin)

      if (kid) {
        const { error } = await supabase.from('kids').update(payload).eq('id', kid.id)
        if (error) throw error
      } else {
        if (!pin) throw new Error('Set a PIN for new kids')
        payload.family_id = familyId
        const { error } = await supabase.from('kids').insert(payload)
        if (error) throw error
      }
      onSaved()
      onClose()
    } catch (e) { setErr(e.message ?? String(e)) }
    finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="panel p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-3">{kid ? 'Edit kid' : 'Add a kid'}</h2>
        <form onSubmit={save} className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">{kid ? 'New PIN (leave blank to keep)' : 'PIN (4–6 digits)'}</label>
            <input className="input" type="password" inputMode="numeric" pattern="[0-9]*" value={pin} onChange={(e) => setPin(e.target.value)} />
          </div>
          <div>
            <label className="label">Avatar color</label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-full"
                  style={{ background: c, outline: color === c ? '2px solid white' : 'none' }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Birth year (optional)</label>
            <input className="input" type="number" min="1990" max="2030" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} />
          </div>
          {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
          <div className="flex gap-2 pt-2">
            <button type="button" className="btn-ghost btn flex-1" onClick={onClose}>Cancel</button>
            <button className="btn flex-1" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
