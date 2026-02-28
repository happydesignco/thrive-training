import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { pushAllUserData, pullAllUserData } from '../lib/sync'

export default function LoginScreen() {
  const { signUp, signIn, resetPassword } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(trimmedEmail, password)
        if (data.session) {
          // Seed cloud with any existing localStorage data
          const username = trimmedEmail.split('@')[0]
          await pushAllUserData(data.user.id, username)
        } else {
          // Email confirmation required
          setInfo('Check your email to confirm your account')
        }
      } else {
        const data = await signIn(trimmedEmail, password)
        // Restore cloud data to localStorage
        const username = trimmedEmail.split('@')[0]
        await pullAllUserData(data.user.id, username)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleForgotPassword() {
    setError(null)
    setInfo(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Enter your email address first')
      return
    }

    setBusy(true)
    try {
      await resetPassword(trimmedEmail)
      setInfo('Check your email for a login link')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl tracking-widest uppercase font-medium text-magenta mb-8">
        Thrive
      </h1>

      {/* Mode toggle */}
      <div className="flex w-full max-w-xs mb-6 border border-border rounded overflow-hidden">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(null); setInfo(null) }}
          className={`flex-1 py-2 text-xs uppercase tracking-wider transition-colors ${
            mode === 'login'
              ? 'bg-magenta text-black font-medium'
              : 'bg-input-bg text-white/50'
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
          className={`flex-1 py-2 text-xs uppercase tracking-wider transition-colors ${
            mode === 'signup'
              ? 'bg-magenta text-black font-medium'
              : 'bg-input-bg text-white/50'
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full bg-input-bg border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full bg-input-bg border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta"
          />
        </div>

        {error && (
          <p className="text-orange text-xs">{error}</p>
        )}

        {info && (
          <p className="text-green text-xs">{info}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-magenta text-black font-medium py-2 rounded uppercase tracking-wider text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {busy
            ? '...'
            : mode === 'signup'
              ? 'Create Account'
              : 'Log In'
          }
        </button>

        {mode === 'login' && (
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={busy}
            className="w-full text-white/40 text-xs hover:text-white/60 transition-colors disabled:opacity-50"
          >
            Forgot password?
          </button>
        )}
      </form>
    </div>
  )
}
