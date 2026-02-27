import conditioning from './conditioning.json'
import metcon from './metcon.json'
import accessory from './accessory.json'

const allWorkouts = [...conditioning, ...metcon, ...accessory]

export default allWorkouts

export const categories = [...new Set(allWorkouts.map(w => w.category))].sort()

export const CATEGORY_LABELS = {
  conditioning: 'Conditioning',
  metcon: 'MetCon',
  accessory: 'Accessory',
}

export const formats = [...new Set(allWorkouts.map(w => w.format))].sort()

export const tracks = [...new Set(allWorkouts.flatMap(w => w.track))].sort()

export function filterWorkouts({ category, format, track, search } = {}) {
  return allWorkouts.filter(w => {
    if (category && w.category !== category) return false
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
