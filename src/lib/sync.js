import { supabase } from './supabase'

/**
 * Upsert one key-value pair to user_data. Fire-and-forget.
 */
export async function pushUserData(userId, key, value) {
  if (!supabase || !userId) return
  try {
    await supabase.from('user_data').upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  } catch (err) {
    console.warn('[sync] pushUserData failed:', err)
  }
}

/**
 * Delete one key from user_data. Fire-and-forget.
 */
export async function deleteUserData(userId, key) {
  if (!supabase || !userId) return
  try {
    await supabase
      .from('user_data')
      .delete()
      .eq('user_id', userId)
      .eq('key', key)
  } catch (err) {
    console.warn('[sync] deleteUserData failed:', err)
  }
}

/**
 * Pull all user_data rows from Supabase into localStorage.
 * Supabase wins on conflicts.
 */
export async function pullAllUserData(userId, localUserId) {
  if (!supabase || !userId) return
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('key, value')
      .eq('user_id', userId)
    if (error) throw error
    if (!data) return
    for (const row of data) {
      localStorage.setItem(
        `thrive:user:${localUserId}:${row.key}`,
        JSON.stringify(row.value)
      )
    }
  } catch (err) {
    console.warn('[sync] pullAllUserData failed:', err)
  }
}

/**
 * Push all localStorage keys for a user up to Supabase.
 * Called on first signup to seed cloud with existing offline data.
 */
export async function pushAllUserData(userId, localUserId) {
  if (!supabase || !userId) return
  try {
    const prefix = `thrive:user:${localUserId}:`
    const rows = []
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i)
      if (!storageKey.startsWith(prefix)) continue
      const key = storageKey.slice(prefix.length)
      let value
      try {
        value = JSON.parse(localStorage.getItem(storageKey))
      } catch {
        value = localStorage.getItem(storageKey)
      }
      rows.push({
        user_id: userId,
        key,
        value,
        updated_at: new Date().toISOString(),
      })
    }
    if (rows.length === 0) return
    const { error } = await supabase
      .from('user_data')
      .upsert(rows, { onConflict: 'user_id,key' })
    if (error) throw error
  } catch (err) {
    console.warn('[sync] pushAllUserData failed:', err)
  }
}
