import { useState, useEffect } from 'react'
import { filterWorkouts, categories, CATEGORY_LABELS, formats, tracks, getWorkoutById } from '../data/workouts'
import WorkoutCard from './WorkoutCard'

export default function WorkoutLibrary() {
  const [category, setCategory] = useState('')
  const [format, setFormat] = useState('')
  const [track, setTrack] = useState('')
  const [search, setSearch] = useState('')
  const [highlightId, setHighlightId] = useState(null)

  // Read URL params for direct workout link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const workoutId = params.get('workout')
    if (workoutId) {
      setHighlightId(workoutId)
      // Scroll to it after render
      setTimeout(() => {
        const el = document.getElementById(`workout-${workoutId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const results = filterWorkouts({ category, format, track, search })

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

        <select value={track} onChange={e => setTrack(e.target.value)} className={selectClass}>
          <option value="">All Tracks</option>
          {tracks.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-input-bg border border-border rounded-md px-2 py-2 font-mono text-xs flex-1 min-w-[120px]"
        />
      </div>

      {/* Results count */}
      <p className="text-xs opacity-50 mb-4">{results.length} workout{results.length !== 1 ? 's' : ''}</p>

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 group/grid">
        {results.map(workout => (
          <div
            key={workout.id}
            id={`workout-${workout.id}`}
            className={`transition-opacity group-hover/grid:opacity-50 hover:!opacity-100
              ${highlightId === workout.id ? 'ring-2 ring-magenta' : ''}`}
          >
            <WorkoutCard workout={workout} />
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-center opacity-50 mt-8">No workouts match your filters.</p>
      )}
    </div>
  )
}
