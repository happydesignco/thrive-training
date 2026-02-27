import { useState, useEffect } from 'react'
import WeekView from './WeekView'
import FiveThreeOne from './FiveThreeOne'
import WorkoutLibrary from './WorkoutLibrary'
import Roulette from './Roulette'
import InstallPrompt from './InstallPrompt'

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
      <header className="flex items-center px-4 py-3 border-b border-border">
        <h1 className="text-lg tracking-widest uppercase font-medium text-magenta">
          Thrive
        </h1>
      </header>

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
