import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { pushAllUserData, pullAllUserData } from '../lib/sync'

export default function LoginScreen() {
  const { signUp, signIn } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(trimmed, pin)
        // Seed cloud with any existing localStorage data
        await pushAllUserData(data.user.id, trimmed.toLowerCase())
      } else {
        const data = await signIn(trimmed, pin)
        // Restore cloud data to localStorage
        await pullAllUserData(data.user.id, trimmed.toLowerCase())
      }
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

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
            Username
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="username"
            className="w-full bg-input-bg border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1">
            PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            className="w-full bg-input-bg border border-border rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-magenta"
          />
        </div>

        {error && (
          <p className="text-orange text-xs">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full bg-magenta text-black font-medium py-2 rounded uppercase tracking-wider text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {busy ? '...' : mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>

        <p className="text-center text-xs text-white/50">
          {mode === 'login' ? (
            <>
              No account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null) }}
                className="text-magenta hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null) }}
                className="text-magenta hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
