import { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useAuth } from '../hooks/useAuth'
import { DEFAULT_SCHEDULES, SLOT_TYPES } from '../data/schedules'
import { CATEGORY_LABELS } from '../data/workouts'
import { publishSchedule, unpublishSchedule } from '../lib/publishedSchedules'

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
  const { currentUser, getSchedule, getUserData, setUserData, removeUserData, publishedSchedules, refreshPublishedSchedules } = useUser()
  const { userId, username } = useAuth()
  const scheduleId = currentUser.scheduleId || currentUser.track || 'hybrid'

  const [presetId, setPresetId] = useState(scheduleId)
  const [days, setDays] = useState(() => {
    const schedule = getSchedule()
    return { ...schedule.days }
  })
  const [hasCustom, setHasCustom] = useState(() => !!getUserData('schedule'))
  const [publishOpen, setPublishOpen] = useState(false)
  const [pubName, setPubName] = useState('')
  const [pubDesc, setPubDesc] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [pubError, setPubError] = useState(null)

  const myPublished = publishedSchedules.find(s => s.username === username)

  function handlePresetChange(id) {
    setPresetId(id)
    const preset = DEFAULT_SCHEDULES[id]
    if (preset) {
      setDays({ ...preset.days })
    } else {
      const pub = publishedSchedules.find(s => s.id === id)
      if (pub) {
        setDays({ ...pub.days })
      }
    }
  }

  function handleDayChange(day, value) {
    setDays(prev => ({ ...prev, [day]: value }))
  }

  function handleSave() {
    const preset = DEFAULT_SCHEDULES[presetId]
    const pub = publishedSchedules.find(s => s.id === presetId)
    const isCustom = preset && JSON.stringify(days) !== JSON.stringify(preset.days)

    if (pub) {
      setUserData('schedule', {
        id: pub.id,
        name: pub.name,
        description: pub.description,
        days,
        defaultWorkouts: pub.defaultWorkouts,
      })
      setHasCustom(true)
    } else if (isCustom || !preset) {
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

      {/* Publish section */}
      <div className="mt-6 pt-4 border-t border-border">
        <span className="text-xs uppercase tracking-wider opacity-50 block mb-3">Publish</span>

        {myPublished ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs opacity-70">
              Your schedule "{myPublished.name}" is published.
            </p>
            <button
              onClick={async () => {
                try {
                  await unpublishSchedule(userId)
                  await refreshPublishedSchedules()
                } catch (err) {
                  setPubError(err.message)
                }
              }}
              className="border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors bg-black text-xs"
              style={{
                color: 'color-mix(in srgb, var(--color-orange) 40%, white)',
                borderColor: 'color-mix(in srgb, var(--color-orange) 40%, white)',
              }}
            >
              Unpublish
            </button>
          </div>
        ) : !publishOpen ? (
          <button
            onClick={() => setPublishOpen(true)}
            className="border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors bg-black text-xs"
            style={{
              color: 'color-mix(in srgb, var(--color-cyan) 40%, white)',
              borderColor: 'color-mix(in srgb, var(--color-cyan) 40%, white)',
            }}
          >
            Publish My Schedule
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Schedule name"
              value={pubName}
              onChange={e => setPubName(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-input-bg font-mono text-xs"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={pubDesc}
              onChange={e => setPubDesc(e.target.value)}
              className="w-full p-2 border border-border rounded-md bg-input-bg font-mono text-xs"
            />
            {pubError && <p className="text-orange text-xs">{pubError}</p>}
            <div className="flex gap-2">
              <button
                disabled={publishing || !pubName.trim()}
                onClick={async () => {
                  setPubError(null)
                  setPublishing(true)
                  try {
                    // Grab current week's swap assignments as defaultWorkouts
                    const weekKey = Object.keys(localStorage)
                      .filter(k => k.startsWith(`thrive:user:${username}:week:`))
                      .sort()
                      .pop()
                    let defaultWorkouts = {}
                    if (weekKey) {
                      try { defaultWorkouts = JSON.parse(localStorage.getItem(weekKey)) || {} } catch {}
                    }
                    await publishSchedule(userId, username, {
                      name: pubName.trim(),
                      description: pubDesc.trim(),
                      days,
                      defaultWorkouts,
                    })
                    await refreshPublishedSchedules()
                    setPublishOpen(false)
                    setPubName('')
                    setPubDesc('')
                  } catch (err) {
                    setPubError(err.message)
                  } finally {
                    setPublishing(false)
                  }
                }}
                className="flex-1 border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors bg-black text-xs disabled:opacity-50"
                style={{
                  color: 'color-mix(in srgb, var(--color-cyan) 40%, white)',
                  borderColor: 'color-mix(in srgb, var(--color-cyan) 40%, white)',
                }}
              >
                {publishing ? '...' : 'Publish'}
              </button>
              <button
                onClick={() => { setPublishOpen(false); setPubError(null) }}
                className="border uppercase tracking-wider font-mono py-2 px-4 cursor-pointer transition-colors bg-black text-xs opacity-50 hover:opacity-100"
                style={{ borderColor: 'var(--color-border)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
