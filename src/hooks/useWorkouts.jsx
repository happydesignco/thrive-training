import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const WorkoutContext = createContext()

const CACHE_KEY = 'thrive:workouts'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(workouts) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(workouts))
  } catch { /* quota exceeded — ignore */ }
}

export function WorkoutProvider({ children }) {
  const { userId } = useAuth()
  const [workouts, setWorkouts] = useState(() => readCache() || [])
  const [loading, setLoading] = useState(() => !readCache())

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchWorkouts() {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('category')
        .order('legacy_id')

      if (cancelled) return

      if (error) {
        console.error('Failed to fetch workouts:', error)
        setLoading(false)
        return
      }

      setWorkouts(data)
      writeCache(data)
      setLoading(false)
    }

    fetchWorkouts()
    return () => { cancelled = true }
  }, [userId])

  const getWorkoutById = useCallback((id) => {
    if (!id) return null
    return workouts.find(w => w.id === id || w.legacy_id === id) || null
  }, [workouts])

  const filterWorkouts = useCallback(({ category, format, search } = {}) => {
    return workouts.filter(w => {
      if (category && w.category !== category) return false
      if (format && w.format !== format) return false
      if (search) {
        const q = search.toLowerCase()
        const haystack = `${w.name} ${w.title}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [workouts])

  const categories = useMemo(
    () => [...new Set(workouts.map(w => w.category))].sort(),
    [workouts]
  )

  const formats = useMemo(
    () => [...new Set(workouts.map(w => w.format).filter(Boolean))].sort(),
    [workouts]
  )

  const createWorkout = useCallback(async (data) => {
    if (!supabase) throw new Error('Supabase not configured')
    const row = { ...data, created_by: userId, is_seed: false }
    const { data: created, error } = await supabase
      .from('workouts')
      .insert(row)
      .select()
      .single()
    if (error) throw error
    setWorkouts(prev => {
      const next = [...prev, created]
      writeCache(next)
      return next
    })
    return created
  }, [userId])

  const updateWorkout = useCallback(async (id, data) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data: updated, error } = await supabase
      .from('workouts')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setWorkouts(prev => {
      const next = prev.map(w => w.id === id ? updated : w)
      writeCache(next)
      return next
    })
    return updated
  }, [])

  const deleteWorkout = useCallback(async (id) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
    if (error) throw error
    setWorkouts(prev => {
      const next = prev.filter(w => w.id !== id)
      writeCache(next)
      return next
    })
  }, [])

  return (
    <WorkoutContext.Provider value={{
      workouts,
      loading,
      getWorkoutById,
      filterWorkouts,
      categories,
      formats,
      createWorkout,
      updateWorkout,
      deleteWorkout,
    }}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkouts() {
  const ctx = useContext(WorkoutContext)
  if (!ctx) throw new Error('useWorkouts must be used within WorkoutProvider')
  return ctx
}
