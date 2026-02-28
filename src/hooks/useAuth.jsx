import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

function toEmail(username) {
  return `${username.toLowerCase()}@thriveapp.io`
}

function toPassword(pin) {
  return `tv${pin}`
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

    async function fetchUsername(userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .single()
        if (error) throw error
        setUsername(data?.username ?? null)
      } catch (err) {
        console.warn('[auth] Failed to fetch profile:', err)
        setUsername(null)
      }
    }

    // Initial session load
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) fetchUsername(s.user.id)
    }).catch(err => {
      console.warn('[auth] getSession failed:', err)
    }).finally(() => {
      setLoading(false)
    })

    // Only sync session + clear state on sign out.
    // signIn/signUp already set username directly.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        if (!s) setUsername(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (name, pin) => {
    if (!supabase) throw new Error('Supabase not configured')
    const nameLower = name.toLowerCase()

    const { data, error } = await supabase.auth.signUp({
      email: toEmail(nameLower),
      password: toPassword(pin),
    })
    if (error) {
      // Duplicate email means username is taken
      if (error.message?.includes('already registered')) {
        throw new Error('Username already taken')
      }
      throw error
    }

    setUsername(nameLower)
    setSession(data.session)
    return data
  }, [])

  const signIn = useCallback(async (name, pin) => {
    if (!supabase) throw new Error('Supabase not configured')
    const nameLower = name.toLowerCase()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: toEmail(nameLower),
      password: toPassword(pin),
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
