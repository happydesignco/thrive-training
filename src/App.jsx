import { AuthProvider, useAuth } from './hooks/useAuth'
import { UserProvider, useUser } from './hooks/useUser'
import Layout from './components/Layout'
import LoginScreen from './components/LoginScreen'
import Onboarding from './components/Onboarding'

function AuthenticatedContent() {
  const { needsOnboarding } = useUser()
  if (needsOnboarding) return <Onboarding />
  return <Layout />
}

function AppContent() {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-magenta animate-pulse tracking-widest uppercase">
          Loading...
        </span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <UserProvider>
      <AuthenticatedContent />
    </UserProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
