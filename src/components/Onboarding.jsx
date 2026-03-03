import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { DEFAULT_SCHEDULES, SLOT_TYPES } from '../data/schedules'
import { CATEGORY_LABELS } from '../data/workoutConstants'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}

const SLOT_LABELS = {
  rest: 'Rest',
  '531': '5/3/1',
  ...CATEGORY_LABELS,
}

const SLOT_COLORS = {
  rest: 'opacity-30',
  '531': 'text-cyan',
  conditioning: 'text-cyan',
  metcon: 'text-magenta',
  accessory: 'text-neon-green',
}

export default function Onboarding() {
  const { setUserData, completeOnboarding, publishedSchedules } = useUser()

  const [selectedId, setSelectedId] = useState('hybrid')
  const [days, setDays] = useState({ ...DEFAULT_SCHEDULES.hybrid.days })

  function handleSelect(id) {
    setSelectedId(id)
    const preset = DEFAULT_SCHEDULES[id]
    if (preset) {
      setDays({ ...preset.days })
      return
    }
    const pub = publishedSchedules.find(s => s.id === id)
    if (pub) {
      setDays({ ...pub.days })
    }
  }

  function handleStart() {
    const preset = DEFAULT_SCHEDULES[selectedId]
    const pub = publishedSchedules.find(s => s.id === selectedId)

    if (pub) {
      setUserData('schedule', {
        id: pub.id,
        name: pub.name,
        description: pub.description,
        days,
        publisherUserId: pub.publisherUserId,
      })
    } else if (preset) {
      // Only save if they customized the days
      if (JSON.stringify(days) !== JSON.stringify(preset.days)) {
        setUserData('schedule', {
          id: 'custom',
          name: 'Custom',
          description: 'Custom schedule',
          days,
        })
      }
      // Otherwise use default — no need to save
    }

    completeOnboarding()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl tracking-widest uppercase font-medium text-magenta text-center mb-2">
          Thrive
        </h1>
        <p className="text-center text-sm opacity-50 mb-8">Choose your training schedule</p>

        {/* Schedule selector */}
        <label className="block mb-4">
          <span className="text-xs uppercase tracking-wider opacity-50 block mb-2">Schedule</span>
          <select
            value={selectedId}
            onChange={e => handleSelect(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-input-bg font-mono text-xs"
          >
            {Object.values(DEFAULT_SCHEDULES).map(s => (
              <option key={s.id} value={s.id}>{s.name} — {s.description}</option>
            ))}
            {publishedSchedules.length > 0 && (
              <optgroup label="Community">
                {publishedSchedules.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} by @{s.username}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        {/* 7-day preview */}
        <div className="border border-border bg-card-bg mb-6">
          {DAYS.map(day => (
            <div key={day} className="flex items-center gap-3 px-4 py-2 border-b border-border last:border-b-0">
              <span className="text-xs uppercase tracking-wider w-8 shrink-0 opacity-50">
                {DAY_LABELS[day]}
              </span>
              <span className={`text-xs font-medium ${SLOT_COLORS[days[day]] || ''}`}>
                {SLOT_LABELS[days[day]] || days[day]}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="w-full bg-magenta text-black font-medium py-3 rounded uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
        >
          Start Training
        </button>

        <p className="text-center text-xs opacity-30 mt-4">
          You can change this anytime from the settings gear.
        </p>
      </div>
    </div>
  )
}
