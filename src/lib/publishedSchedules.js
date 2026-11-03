import { supabase } from './supabase'

export async function fetchPublishedSchedules() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('published_schedules')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map(row => ({
      id: `published:${row.id}`,
      publisherUserId: row.user_id,
      username: row.username,
      name: row.name,
      description: row.description,
      days: row.days,
      isPublished: true,
    }))
  } catch (err) {
    console.warn('[publishedSchedules] fetch failed:', err)
    return []
  }
}

export async function fetchPublisherWeekData(userId, weekStart) {
  if (!supabase) return {}
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('value')
      .eq('user_id', userId)
      .eq('key', `week:${weekStart}`)
      .maybeSingle()
    if (error) throw error
    return data?.value || {}
  } catch (err) {
    console.warn('[publishedSchedules] fetchPublisherWeekData failed:', err)
    return {}
  }
}

export async function publishSchedule(userId, username, { name, description, days }) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('published_schedules')
    .upsert(
      {
        user_id: userId,
        username,
        name,
        description: description || '',
        days,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
  if (error) throw error
}

export async function unpublishSchedule(userId) {
  if (!supabase) return
  const { error } = await supabase
    .from('published_schedules')
    .delete()
    .eq('user_id', userId)
  if (error) throw error
}

// Publishers the user may post to (rows in schedule_editors).
export async function fetchEditablePublisherIds(userId) {
  if (!supabase || !userId) return []
  try {
    const { data, error } = await supabase
      .from('schedule_editors')
      .select('publisher_id')
      .eq('editor_id', userId)
    if (error) throw error
    return (data || []).map(r => r.publisher_id)
  } catch (err) {
    console.warn('[publishedSchedules] fetchEditablePublisherIds failed:', err)
    return []
  }
}

// Merge days into a publisher's week, as an editor. Reads fresh first so
// days other people posted aren't lost.
export async function postToPublisherWeek(publisherUserId, weekStart, daysPatch) {
  if (!supabase) throw new Error('Supabase not configured')
  const key = `week:${weekStart}`
  const { data, error: readError } = await supabase
    .from('user_data')
    .select('value')
    .eq('user_id', publisherUserId)
    .eq('key', key)
    .maybeSingle()
  if (readError) throw readError
  const value = { ...(data?.value || {}), ...daysPatch }
  const { error } = await supabase
    .from('user_data')
    .upsert(
      { user_id: publisherUserId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
  if (error) throw error
  return value
}
