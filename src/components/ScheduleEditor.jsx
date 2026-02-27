import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { DEFAULT_SCHEDULES, SLOT_TYPES } from '../data/schedules'
import { CATEGORY_LABELS } from '../data/workouts'

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

export default function ScheduleEditor({ onClose }) {
  const { currentUser, getSchedule, getUserData, setUserData, removeUserData } = useUser()
  const scheduleId = currentUser.scheduleId || currentUser.track || 'hybrid'

  const [presetId, setPresetId] = useState(scheduleId)
  const [days, setDays] = useState(() => {
    const schedule = getSchedule()
    return { ...schedule.days }
  })
  const [hasCustom, setHasCustom] = useState(() => !!getUserData('schedule'))

  function handlePresetChange(id) {
    setPresetId(id)
    const preset = DEFAULT_SCHEDULES[id]
    if (preset) {
      setDays({ ...preset.days })
    }
  }

  function handleDayChange(day, value) {
    setDays(prev => ({ ...prev, [day]: value }))
  }

  function handleSave() {
    const preset = DEFAULT_SCHEDULES[presetId]
    const isCustom = preset && JSON.stringify(days) !== JSON.stringify(preset.days)

    if (isCustom || !preset) {
      setUserData('schedule', {
        id: 'custom',
        name: 'Custom',
        description: 'Custom schedule',
        days,
      })
      setHasCustom(true)
    } else {
      removeUserData('schedule')
      setHasCustom(false)
    }
    onClose?.()
  }

  function handleReset() {
    const preset = DEFAULT_SCHEDULES[presetId]
    if (preset) {
      setDays({ ...preset.days })
    }
    removeUserData('schedule')
    setHasCustom(false)
  }

  const selectClass = "w-full p-2 border border-border rounded-md bg-input-bg font-mono text-xs"

  return (
    <div className="max-w-[400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl">Schedule</h2>
        <button
          onClick={onClose}
          className="text-xs opacity-50 hover:opacity-100 transition-opacity"
        >
          Close
        </button>
      </div>

      {/* Preset selector */}
      <label className="block mb-4">
        <span className="text-xs uppercase tracking-wider opacity-50 block mb-2">Preset</span>
        <select
          value={presetId}
          onChange={e => handlePresetChange(e.target.value)}
          className={selectClass}
        >
          {Object.values(DEFAULT_SCHEDULES).map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.description}</option>
          ))}
        </select>
      </label>

      {/* 7-day grid */}
      <div className="flex flex-col gap-2 mb-6">
        <span className="text-xs uppercase tracking-wider opacity-50">Days</span>
        {DAYS.map(day => (
          <div key={day} className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider w-8 shrink-0 opacity-50">
              {DAY_LABELS[day]}
            </span>
            <select
              value={days[day]}
              onChange={e => handleDayChange(day, e.target.value)}
              className={selectClass}
            >
              {SLOT_TYPES.map(type => (
                <option key={type} value={type}>{SLOT_LABELS[type]}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          onClick={handleSave}
          className="flex-1 border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors bg-black"
          style={{
            color: 'color-mix(in srgb, var(--color-magenta) 40%, white)',
            borderColor: 'color-mix(in srgb, var(--color-magenta) 40%, white)',
          }}
        >
          Save
        </button>
        {hasCustom && (
          <button
            onClick={handleReset}
            className="flex-1 border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors bg-black"
            style={{
              color: 'color-mix(in srgb, var(--color-orange) 40%, white)',
              borderColor: 'color-mix(in srgb, var(--color-orange) 40%, white)',
            }}
          >
            Reset to Preset
          </button>
        )}
      </div>
    </div>
  )
}
