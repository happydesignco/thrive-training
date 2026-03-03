const SECTION_COLORS = [
  'var(--color-magenta)',
  'var(--color-cyan)',
  'var(--color-neon-green)',
  'var(--color-yellow)',
  'var(--color-orange)',
]

import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/workoutConstants'

export default function WorkoutCard({ workout, isOwned, onEdit, onDelete }) {
  const sections = Object.entries(workout.sections)

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?tab=library&workout=${workout.id}`
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="bg-card-bg p-4 flex flex-col gap-4 border border-black hover:border-white hover:bg-black transition-all">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-50 uppercase tracking-wider">
            #{workout.workout_number || workout.id}
          </span>
          <span
            className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded"
            style={{
              color: CATEGORY_COLORS[workout.category],
              border: `1px solid ${CATEGORY_COLORS[workout.category]}`,
            }}
          >
            {CATEGORY_LABELS[workout.category] || workout.category}
          </span>
        </div>
        <h3 className="text-base font-semibold">{workout.name}</h3>
        {workout.excerpt && (
          <p className="text-xs opacity-60 mt-1 italic">{workout.excerpt}</p>
        )}
        <p className="text-xs opacity-40 mt-1">{workout.title}</p>
      </div>

      {sections.map(([key, section], idx) => {
        const color = SECTION_COLORS[idx % 5]
        return (
          <div key={key} className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-wider opacity-50">{section.type}</p>
            {section.title && (
              <h4 className="text-sm font-bold" style={{ color }}>{section.title}</h4>
            )}
            <ul className="list-none pl-4" style={{ borderLeft: `2px solid ${color}` }}>
              {section.description.map((line, i) => (
                <li key={i} className="mb-1 text-xs">{line}</li>
              ))}
            </ul>
            {section.alternatives && (
              <ul className="list-none pl-4 opacity-50" style={{ borderLeft: `2px solid ${color}` }}>
                {section.alternatives.map((alt, i) => (
                  <li key={i} className="mb-1 text-xs">{alt}</li>
                ))}
              </ul>
            )}
          </div>
        )
      })}

      <div className="mt-auto flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 py-2 px-4 bg-black border border-white text-white uppercase tracking-wider font-mono text-xs cursor-pointer hover:bg-magenta transition-colors"
        >
          Share
        </button>
        {isOwned && onEdit && (
          <button
            onClick={() => onEdit(workout)}
            className="py-2 px-4 bg-black border border-cyan text-cyan uppercase tracking-wider font-mono text-xs cursor-pointer hover:bg-cyan hover:text-black transition-colors"
          >
            Edit
          </button>
        )}
        {isOwned && onDelete && (
          <button
            onClick={() => onDelete(workout)}
            className="py-2 px-4 bg-black border border-orange text-orange uppercase tracking-wider font-mono text-xs cursor-pointer hover:bg-orange hover:text-black transition-colors"
          >
            Del
          </button>
        )}
      </div>
    </div>
  )
}
