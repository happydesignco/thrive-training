import { useState, useEffect } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useAuth } from '../hooks/useAuth'
import { CATEGORY_LABELS } from '../data/workoutConstants'
import WorkoutCard from './WorkoutCard'
import WorkoutEditor from './WorkoutEditor'

export default function WorkoutLibrary() {
  const { filterWorkouts, categories, formats, deleteWorkout } = useWorkouts()
  const { userId } = useAuth()

  const [category, setCategory] = useState('')
  const [format, setFormat] = useState('')
  const [search, setSearch] = useState('')
  const [highlightId, setHighlightId] = useState(null)
  const [editing, setEditing] = useState(null) // null | 'new' | workout object

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const workoutId = params.get('workout')
    if (workoutId) {
      setHighlightId(workoutId)
      setTimeout(() => {
        const el = document.getElementById(`workout-${workoutId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const results = filterWorkouts({ category, format, search })

  async function handleDelete(workout) {
    if (!confirm(`Delete "${workout.name}"?`)) return
    try {
      await deleteWorkout(workout.id)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (editing) {
    return (
      <WorkoutEditor
        workout={editing === 'new' ? undefined : editing}
        onClose={() => setEditing(null)}
      />
    )
  }

  const selectClass = "bg-input-bg border border-border rounded-md px-2 py-2 font-mono text-xs"

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>
          ))}
        </select>

        <select value={format} onChange={e => setFormat(e.target.value)} className={selectClass}>
          <option value="">All Formats</option>
          {formats.map(f => (
            <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-input-bg border border-border rounded-md px-2 py-2 font-mono text-xs flex-1 min-w-[120px]"
        />

        <button
          onClick={() => setEditing('new')}
          className="px-4 py-2 bg-magenta text-black font-bold uppercase tracking-wider text-xs rounded-md"
        >
          + Add Workout
        </button>
      </div>

      {/* Results count */}
      <p className="text-xs opacity-50 mb-4">{results.length} workout{results.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 group/grid">
        {results.map(workout => {
          const isOwned = workout.created_by === userId && !workout.is_seed
          return (
            <div
              key={workout.id}
              id={`workout-${workout.id}`}
              className={`transition-opacity group-hover/grid:opacity-50 hover:!opacity-100
                ${highlightId === workout.id ? 'ring-2 ring-magenta' : ''}`}
            >
              <WorkoutCard
                workout={workout}
                isOwned={isOwned}
                onEdit={isOwned ? (w) => setEditing(w) : undefined}
                onDelete={isOwned ? handleDelete : undefined}
              />
            </div>
          )
        })}
      </div>

      {results.length === 0 && (
        <p className="text-center opacity-50 mt-8">No workouts match your filters.</p>
      )}
    </div>
  )
}
