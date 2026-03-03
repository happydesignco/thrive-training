import { useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { CATEGORY_LABELS } from '../data/workoutConstants'

const EMPTY_SECTION = { type: '', title: '', description: '', alternatives: '' }

function parseSections(sections) {
  if (!sections || typeof sections !== 'object') return [{ ...EMPTY_SECTION }]
  return Object.entries(sections).map(([, s]) => ({
    type: s.type || '',
    title: s.title || '',
    description: Array.isArray(s.description) ? s.description.join('\n') : (s.description || ''),
    alternatives: Array.isArray(s.alternatives) ? s.alternatives.join('\n') : (s.alternatives || ''),
  }))
}

function buildSections(arr) {
  const out = {}
  arr.forEach((s, i) => {
    const key = String.fromCharCode(65 + i) // A, B, C...
    const section = {
      type: s.type.trim(),
      description: s.description.split('\n').map(l => l.trim()).filter(Boolean),
    }
    if (s.title.trim()) section.title = s.title.trim()
    const alts = s.alternatives.split('\n').map(l => l.trim()).filter(Boolean)
    if (alts.length) section.alternatives = alts
    out[key] = section
  })
  return out
}

export default function WorkoutEditor({ workout, onClose }) {
  const { createWorkout, updateWorkout } = useWorkouts()
  const isEdit = !!workout

  const [name, setName] = useState(workout?.name || '')
  const [title, setTitle] = useState(workout?.title || '')
  const [category, setCategory] = useState(workout?.category || 'conditioning')
  const [format, setFormat] = useState(workout?.format || '')
  const [excerpt, setExcerpt] = useState(workout?.excerpt || '')
  const [equipment, setEquipment] = useState(
    Array.isArray(workout?.equipment) ? workout.equipment.join(', ') : ''
  )
  const [durationMinutes, setDurationMinutes] = useState(workout?.duration_minutes || '')
  const [intensity, setIntensity] = useState(workout?.intensity || '')
  const [notes, setNotes] = useState(workout?.notes || '')
  const [isPublic, setIsPublic] = useState(workout?.is_public || false)
  const [sections, setSections] = useState(() => parseSections(workout?.sections))
  const [scaling, setScaling] = useState(() => {
    if (!workout?.scaling) return ''
    if (typeof workout.scaling === 'string') return workout.scaling
    return Object.entries(workout.scaling).map(([k, v]) => `${k}: ${v}`).join('\n')
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function updateSection(idx, field, value) {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  function addSection() {
    setSections(prev => [...prev, { ...EMPTY_SECTION }])
  }

  function removeSection(idx) {
    setSections(prev => prev.filter((_, i) => i !== idx))
  }

  function parseScaling(text) {
    if (!text.trim()) return null
    const lines = text.split('\n').filter(l => l.trim())
    const obj = {}
    for (const line of lines) {
      const colonIdx = line.indexOf(':')
      if (colonIdx > 0) {
        obj[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim()
      }
    }
    return Object.keys(obj).length > 0 ? obj : null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) { setError('Name is required'); return }
    if (!title.trim()) { setError('Title is required'); return }
    const validSections = sections.filter(s => s.type.trim() && s.description.trim())
    if (validSections.length === 0) { setError('At least one section with type and description is required'); return }

    const data = {
      name: name.trim(),
      title: title.trim(),
      category,
      format: format.trim() || null,
      sections: buildSections(validSections),
      scaling: parseScaling(scaling),
      excerpt: excerpt.trim() || null,
      equipment: equipment.split(',').map(s => s.trim()).filter(Boolean),
      duration_minutes: durationMinutes ? Number(durationMinutes) : null,
      intensity: intensity.trim() || null,
      notes: notes.trim() || null,
      is_public: isPublic,
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateWorkout(workout.id, data)
      } else {
        await createWorkout(data)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputClass = "w-full p-2 border border-border rounded-md bg-input-bg font-mono text-xs"

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl">{isEdit ? 'Edit Workout' : 'New Workout'}</h2>
        <button onClick={onClose} className="text-xs opacity-50 hover:opacity-100 transition-opacity">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Name *</span>
          <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Thunderbolt" />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Title *</span>
          <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Row/Bike Intervals + Sled Push" />
        </label>

        <div className="flex gap-3">
          <label className="flex-1">
            <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Category *</span>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <label className="flex-1">
            <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Format</span>
            <input value={format} onChange={e => setFormat(e.target.value)} className={inputClass} placeholder="e.g. for_time" />
          </label>
        </div>

        <label>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Excerpt</span>
          <input value={excerpt} onChange={e => setExcerpt(e.target.value)} className={inputClass} placeholder="Short tagline" />
        </label>

        <div className="flex gap-3">
          <label className="flex-1">
            <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Duration (min)</span>
            <input type="number" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} className={inputClass} />
          </label>
          <label className="flex-1">
            <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Intensity</span>
            <input value={intensity} onChange={e => setIntensity(e.target.value)} className={inputClass} placeholder="e.g. high" />
          </label>
        </div>

        <label>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Equipment (comma-separated)</span>
          <input value={equipment} onChange={e => setEquipment(e.target.value)} className={inputClass} placeholder="rower, ski_erg, sled" />
        </label>

        {/* Sections */}
        <div>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-2">Sections *</span>
          {sections.map((s, idx) => (
            <div key={idx} className="border border-border p-3 mb-3 bg-card-bg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold opacity-70">Section {String.fromCharCode(65 + idx)}</span>
                {sections.length > 1 && (
                  <button type="button" onClick={() => removeSection(idx)} className="text-xs text-orange hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  value={s.type}
                  onChange={e => updateSection(idx, 'type', e.target.value)}
                  className={inputClass}
                  placeholder="Type (e.g. WARM UP, FOR TIME)"
                />
                <input
                  value={s.title}
                  onChange={e => updateSection(idx, 'title', e.target.value)}
                  className={inputClass}
                  placeholder="Title (optional)"
                />
              </div>
              <textarea
                value={s.description}
                onChange={e => updateSection(idx, 'description', e.target.value)}
                className={inputClass + ' min-h-[80px]'}
                placeholder="Description (one line per item)"
              />
              <textarea
                value={s.alternatives}
                onChange={e => updateSection(idx, 'alternatives', e.target.value)}
                className={inputClass + ' min-h-[40px] mt-2'}
                placeholder="Alternatives (optional, one per line)"
              />
            </div>
          ))}
          <button type="button" onClick={addSection} className="text-xs text-cyan hover:underline">
            + Add Section
          </button>
        </div>

        <label>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Scaling (key: value per line)</span>
          <textarea value={scaling} onChange={e => setScaling(e.target.value)} className={inputClass + ' min-h-[60px]'} placeholder={"strength: Heavier sled\nconditioning: As written"} />
        </label>

        <label>
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-1">Notes</span>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className={inputClass + ' min-h-[40px]'} />
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
          <span className="text-xs">Public (visible to all users)</span>
        </label>

        {error && <p className="text-orange text-xs">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-magenta text-black font-bold uppercase tracking-wider text-sm rounded disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEdit ? 'Update Workout' : 'Create Workout'}
        </button>
      </form>
    </div>
  )
}
