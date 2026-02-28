import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

const ADMIN_EMAILS = new Set(
  (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [username, setUsername] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    function usernameFromSession(s) {
      return s?.user?.email?.split('@')[0] || null
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        setSession(s)
        setUsername(usernameFromSession(s))
        if (event === 'INITIAL_SESSION') {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error

    setUsername(email.split('@')[0])
    setSession(data.session)
    return data
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    setUsername(email.split('@')[0])
    setSession(data.session)
    return data
  }, [])

  const resetPassword = useCallback(async (email) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setSession(null)
    setUsername(null)
  }, [])

  const isAdmin = ADMIN_EMAILS.has(session?.user?.email)

  const value = {
    session,
    username,
    userId: session?.user?.id ?? null,
    loading,
    isAuthenticated: !!session,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
