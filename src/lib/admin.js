import { supabase } from './supabase'

export async function fetchUsers() {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_list_users')
  if (error) throw error
  return data || []
}

export async function fetchAllUserData() {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('admin_get_all_user_data')
  if (error) throw error
  return data || []
}
