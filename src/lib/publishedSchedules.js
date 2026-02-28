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
