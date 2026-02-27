import monday from './monday.json'
import wednesday from './wednesday.json'
import thursday from './thursday.json'

const allWorkouts = [...monday, ...wednesday, ...thursday]

export default allWorkouts

export const daySlots = [...new Set(allWorkouts.map(w => w.day_slot))].sort()

export const formats = [...new Set(allWorkouts.map(w => w.format))].sort()

export const tracks = [...new Set(allWorkouts.flatMap(w => w.track))].sort()

export function filterWorkouts({ daySlot, format, track, search } = {}) {
  return allWorkouts.filter(w => {
    if (daySlot && w.day_slot !== daySlot) return false
    if (format && w.format !== format) return false
    if (track && !w.track.includes(track)) return false
    if (search) {
      const q = search.toLowerCase()
      const haystack = `${w.name} ${w.title}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

export function getWorkoutById(id) {
  return allWorkouts.find(w => w.id === id) || null
}
