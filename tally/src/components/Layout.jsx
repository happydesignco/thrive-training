import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useFamily } from '../context/FamilyContext.jsx'

export default function Layout() {
  const { user, signOut } = useAuth()
  const { family } = useFamily()

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-bold text-lg flex items-center gap-2">
            <span className="kid-avatar" style={{width: 28, height: 28, background: 'var(--gold)', fontSize: 14}}>T</span>
            Tally
          </Link>
          <div className="ml-auto text-sm opacity-70 hidden sm:block">
            {family?.name} · <span className="font-mono">{family?.invite_code}</span>
          </div>
          <button className="btn-ghost btn text-xs" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 border-t border-[var(--line)] bg-[var(--panel)]">
        <div className="max-w-3xl mx-auto grid grid-cols-6 text-center">
          <TabLink to="/" label="Home" icon="🏠" end />
          <TabLink to="/board" label="Board" icon="🏆" />
          <TabLink to="/approvals" label="Inbox" icon="📥" />
          <TabLink to="/history" label="History" icon="📅" />
          <TabLink to="/kids" label="Kids" icon="👧" />
          <TabLink to="/rules" label="Rules" icon="⚙️" />
        </div>
      </nav>
    </div>
  )
}

function TabLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `py-3 text-xs flex flex-col items-center gap-0.5 ${
          isActive ? 'text-[var(--gold)]' : 'text-[var(--muted)]'
        }`
      }
    >
      <span className="text-lg leading-none">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}
