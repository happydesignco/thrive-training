import { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { DEFAULT_SCHEDULES } from '../data/schedules'
import { useAuth } from './useAuth'
import { pushUserData, deleteUserData } from '../lib/sync'
import {
  fetchPublishedSchedules, fetchPublisherWeekData,
  fetchEditablePublisherIds, postToPublisherWeek,
} from '../lib/publishedSchedules'

const UserContext = createContext()

function storageKey(userId, key) {
  return `thrive:user:${userId}:${key}`
}

export function UserProvider({ children }) {
  const { username, userId: supabaseUserId } = useAuth()
  const [publishedSchedules, setPublishedSchedules] = useState([])
  const [publisherWeekData, setPublisherWeekData] = useState({})
  const [activeWeekStart, setActiveWeekStart] = useState(null)
  const [editablePublisherIds, setEditablePublisherIds] = useState([])

  useEffect(() => {
    fetchEditablePublisherIds(supabaseUserId).then(setEditablePublisherIds)
  }, [supabaseUserId])

  useEffect(() => {
    fetchPublishedSchedules().then(setPublishedSchedules)
  }, [])

  const refreshPublishedSchedules = useCallback(async () => {
    const schedules = await fetchPublishedSchedules()
    setPublishedSchedules(schedules)
  }, [])

  const currentUser = { id: username, name: username, scheduleId: 'thrive' }

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
    if (custom) {
      if (custom.publisherUserId) {
        const live = publishedSchedules.find(s => s.publisherUserId === custom.publisherUserId)
        if (live) return { ...custom, days: live.days }
      }
      return custom
    }
    // No saved schedule: follow the group (the first schedule ever published).
    const group = publishedSchedules[publishedSchedules.length - 1]
    if (group) return group
    return DEFAULT_SCHEDULES[currentUser.scheduleId] || DEFAULT_SCHEDULES.thrive
  }, [currentUser.scheduleId, getUserData, publishedSchedules])

  // Derive publisherUserId from the active schedule
  const schedule = getSchedule()
  const activePublisherUserId = schedule?.publisherUserId || null

  // Fetch publisher's week data when viewing a subscribed schedule
  useEffect(() => {
    if (!activePublisherUserId || !activeWeekStart) {
      setPublisherWeekData({})
      return
    }

    let cancelled = false

    fetchPublisherWeekData(activePublisherUserId, activeWeekStart)
      .then(data => { if (!cancelled) setPublisherWeekData(data) })

    const handleFocus = () => {
      fetchPublisherWeekData(activePublisherUserId, activeWeekStart)
        .then(data => { if (!cancelled) setPublisherWeekData(data) })
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
    }
  }, [activePublisherUserId, activeWeekStart])

  // Editors post into the publisher's week instead of their own.
  const canPostToGroup = !!activePublisherUserId &&
    activePublisherUserId !== supabaseUserId &&
    editablePublisherIds.includes(activePublisherUserId)

  const postToGroup = useCallback(async (weekStart, daysPatch) => {
    const value = await postToPublisherWeek(activePublisherUserId, weekStart, daysPatch)
    if (weekStart === activeWeekStart) setPublisherWeekData(value)
  }, [activePublisherUserId, activeWeekStart])

  const [onboarded, setOnboarded] = useState(() => !!getUserData('onboarded'))
  const needsOnboarding = !onboarded

  const completeOnboarding = useCallback(() => {
    setUserData('onboarded', true)
    setOnboarded(true)
  }, [setUserData])

  return (
    <UserContext.Provider value={{
      currentUser,
      getUserData, setUserData, removeUserData, getSchedule,
      publishedSchedules, refreshPublishedSchedules,
      publisherWeekData, setActiveWeekStart,
      canPostToGroup, postToGroup,
      needsOnboarding, completeOnboarding,
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
