import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

function toEmail(username) {
  return `${username.toLowerCase()}@thrive.local`
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) {
        // Fetch username from profiles
        supabase
          .from('profiles')
          .select('username')
          .eq('id', s.user.id)
          .single()
          .then(({ data }) => {
            setUsername(data?.username ?? null)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        if (!s) {
          setUsername(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (name, pin) => {
    if (!supabase) throw new Error('Supabase not configured')
    const nameLower = name.toLowerCase()

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', nameLower)
      .maybeSingle()
    if (existing) throw new Error('Username already taken')

    const { data, error } = await supabase.auth.signUp({
      email: toEmail(nameLower),
      password: pin,
    })
    if (error) throw error

    // Create profile row
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: nameLower,
    })
    if (profileErr) throw profileErr

    setUsername(nameLower)
    setSession(data.session)
    return data
  }, [])

  const signIn = useCallback(async (name, pin) => {
    if (!supabase) throw new Error('Supabase not configured')
    const nameLower = name.toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(nameLower),
      password: pin,
    })
    if (error) throw error

    setUsername(nameLower)
    setSession(data.session)
    return data
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setUsername(null)
  }, [])

  const value = {
    session,
    username,
    userId: session?.user?.id ?? null,
    loading,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
