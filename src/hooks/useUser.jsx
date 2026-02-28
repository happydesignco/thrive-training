import { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { DEFAULT_SCHEDULES } from '../data/schedules'
import { useAuth } from './useAuth'
import { pushUserData, deleteUserData } from '../lib/sync'
import { fetchPublishedSchedules } from '../lib/publishedSchedules'

const UserContext = createContext()

function storageKey(userId, key) {
  return `thrive:user:${userId}:${key}`
}

export function UserProvider({ children }) {
  const { username, userId: supabaseUserId } = useAuth()
  const [publishedSchedules, setPublishedSchedules] = useState([])

  useEffect(() => {
    fetchPublishedSchedules().then(setPublishedSchedules)
  }, [])

  const refreshPublishedSchedules = useCallback(async () => {
    const schedules = await fetchPublishedSchedules()
    setPublishedSchedules(schedules)
  }, [])

  const currentUser = { id: username, name: username, scheduleId: 'hybrid' }

  const getUserData = useCallback((key) => {
    const raw = localStorage.getItem(storageKey(currentUser.id, key))
    if (raw === null) return null
    try { return JSON.parse(raw) } catch { return raw }
  }, [currentUser.id])

  const setUserData = useCallback((key, value) => {
    localStorage.setItem(storageKey(currentUser.id, key), JSON.stringify(value))
    pushUserData(supabaseUserId, key, value)
  }, [currentUser.id, supabaseUserId])

  const removeUserData = useCallback((key) => {
    localStorage.removeItem(storageKey(currentUser.id, key))
    deleteUserData(supabaseUserId, key)
  }, [currentUser.id, supabaseUserId])

  const getSchedule = useCallback(() => {
    const custom = getUserData('schedule')
    if (custom) return custom
    return DEFAULT_SCHEDULES[currentUser.scheduleId] || DEFAULT_SCHEDULES.hybrid
  }, [currentUser.scheduleId, getUserData])

  return (
    <UserContext.Provider value={{
      currentUser,
      getUserData, setUserData, removeUserData, getSchedule,
      publishedSchedules, refreshPublishedSchedules,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
