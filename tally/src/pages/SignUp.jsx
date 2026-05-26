import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function SignUp() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [needsConfirm, setNeedsConfirm] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) { setErr(error.message); return }
    if (data.session) {
      nav('/setup-family', { replace: true })
    } else {
      // Email confirmation required.
      setNeedsConfirm(true)
    }
  }

  if (needsConfirm) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="panel p-6 w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2">Check your email</h1>
          <p className="opacity-80">We sent a confirmation link to <span className="font-mono">{email}</span>. After confirming, come back and sign in.</p>
          <div className="mt-6"><Link to="/signin" className="underline">Back to sign in</Link></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="panel p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Start a family</h1>
        <p className="opacity-70 text-sm mb-6">One parent account per household.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Parent email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password (8+ chars)</label>
            <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
          <button className="btn btn-block" disabled={busy}>{busy ? 'Creating…' : 'Continue'}</button>
        </form>
        <div className="mt-4 text-sm opacity-80 text-center">
          Already set up? <Link to="/signin" className="underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
