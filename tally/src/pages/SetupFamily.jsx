import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useFamily } from '../context/FamilyContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function SetupFamily() {
  const { reload, family, loading } = useFamily()
  const { signOut } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  // If they already have a family, bounce home.
  if (!loading && family) {
    nav('/', { replace: true })
    return null
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr(null)
    const { error } = await supabase.rpc('create_family', { p_name: name.trim() })
    if (error) { setErr(error.message); setBusy(false); return }
    await reload()
    nav('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="panel p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Name your family</h1>
        <p className="opacity-70 text-sm mb-6">You'll get an invite code that lets neighborhood families send tokens to your kids.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Family name</label>
            <input className="input" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="The Gronwalds" />
          </div>
          {err && <div className="text-sm text-[var(--coral)]">{err}</div>}
          <button className="btn btn-block" disabled={busy}>{busy ? 'Creating…' : 'Create family'}</button>
        </form>
        <button onClick={signOut} className="mt-4 text-sm opacity-60 underline w-full text-center">Sign out</button>
      </div>
    </div>
  )
}
