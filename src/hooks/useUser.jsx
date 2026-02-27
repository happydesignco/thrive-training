import { createContext, useContext, useState, useCallback } from 'react'
import { DEFAULT_SCHEDULES } from '../data/schedules'

const UserContext = createContext()

const DEFAULT_USERS = [
  { id: 'adam', name: 'Adam', scheduleId: 'hybrid' },
]

function storageKey(userId, key) {
  return `thrive:user:${userId}:${key}`
}

export function UserProvider({ children }) {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('thrive:users')
    return saved ? JSON.parse(saved) : DEFAULT_USERS
  })

  const [currentUser, setCurrentUserState] = useState(() => {
    const savedId = localStorage.getItem('thrive:currentUser')
    const list = localStorage.getItem('thrive:users')
    const userList = list ? JSON.parse(list) : DEFAULT_USERS
    return userList.find(u => u.id === savedId) || userList[0]
  })

  const setCurrentUser = useCallback((user) => {
    setCurrentUserState(user)
    localStorage.setItem('thrive:currentUser', user.id)
  }, [])

  const addUser = useCallback((user) => {
    setUsers(prev => {
      const next = [...prev, user]
      localStorage.setItem('thrive:users', JSON.stringify(next))
      return next
    })
  }, [])

  const getUserData = useCallback((key) => {
    const raw = localStorage.getItem(storageKey(currentUser.id, key))
    if (raw === null) return null
    try { return JSON.parse(raw) } catch { return raw }
  }, [currentUser.id])

  const setUserData = useCallback((key, value) => {
    localStorage.setItem(storageKey(currentUser.id, key), JSON.stringify(value))
  }, [currentUser.id])

  const removeUserData = useCallback((key) => {
    localStorage.removeItem(storageKey(currentUser.id, key))
  }, [currentUser.id])

  const getSchedule = useCallback(() => {
    const custom = getUserData('schedule')
    if (custom) return custom
    const id = currentUser.scheduleId || currentUser.track || 'hybrid'
    return DEFAULT_SCHEDULES[id] || DEFAULT_SCHEDULES.hybrid
  }, [currentUser.scheduleId, currentUser.track, getUserData])

  return (
    <UserContext.Provider value={{
      currentUser, users, setCurrentUser, addUser,
      getUserData, setUserData, removeUserData, getSchedule,
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
