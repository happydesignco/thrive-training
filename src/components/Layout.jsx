import { useState, useEffect } from 'react'
import WeekView from './WeekView'
import FiveThreeOne from './FiveThreeOne'
import WorkoutLibrary from './WorkoutLibrary'
import Roulette from './Roulette'
import InstallPrompt from './InstallPrompt'
import ScheduleEditor from './ScheduleEditor'

const TABS = [
  { id: 'week', label: 'My Week' },
  { id: '531', label: '5/3/1' },
  { id: 'library', label: 'Library' },
  { id: 'roulette', label: 'Roulette' },
]

export default function Layout() {
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'week'
  })
  const [showScheduleEditor, setShowScheduleEditor] = useState(false)

  // Sync tab changes to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set('tab', activeTab)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState(null, '', newUrl)
  }, [activeTab])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg tracking-widest uppercase font-medium text-magenta">
          Thrive
        </h1>
        <button
          onClick={() => setShowScheduleEditor(s => !s)}
          className={`text-sm transition-colors ${
            showScheduleEditor ? 'text-magenta' : 'opacity-50 hover:opacity-100'
          }`}
          title="Schedule"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      {/* Schedule editor panel */}
      {showScheduleEditor && (
        <div className="border-b border-border p-4 bg-card-bg">
          <ScheduleEditor onClose={() => setShowScheduleEditor(false)} />
        </div>
      )}

      {/* Tab bar */}
      <nav className="flex border-b border-border">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-center text-xs uppercase tracking-wider transition-colors
              ${activeTab === tab.id
                ? 'text-magenta border-b-2 border-magenta'
                : 'text-white/50 hover:text-white/80'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 p-4">
        {activeTab === 'week' && <WeekView onNavigate={setActiveTab} />}
        {activeTab === '531' && <FiveThreeOne />}
        {activeTab === 'library' && <WorkoutLibrary />}
        {activeTab === 'roulette' && <Roulette />}
      </main>

      <InstallPrompt />
    </div>
  )
}
