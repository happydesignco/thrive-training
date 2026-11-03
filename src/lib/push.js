import { supabase } from './supabase'

export function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// iPhone only allows web push for apps added to the Home Screen.
export function needsHomeScreenInstall() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
  return ios && !standalone
}

function base64UrlToBytes(b64) {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, c => c.charCodeAt(0))
}

// Subscribe this device and save it. Call from a tap the first time (the
// permission prompt needs a user gesture); safe to call again silently once
// permission is granted.
export async function enablePush(userId) {
  if (!supabase || !userId || !pushSupported()) return false
  const permission = Notification.permission === 'granted'
    ? 'granted'
    : await Notification.requestPermission()
  if (permission !== 'granted') return false

  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    const { data, error } = await supabase.functions.invoke('push', { body: { action: 'key' } })
    if (error || !data?.key) throw new Error('Couldn\'t set up notifications')
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(data.key),
    })
  }
  const { endpoint, keys } = sub.toJSON()
  const { error } = await supabase.from('push_subscriptions').upsert(
    { endpoint, user_id: userId, keys, updated_at: new Date().toISOString() },
    { onConflict: 'endpoint' }
  )
  if (error) throw error
  return true
}

// Tell the group a workout was posted. The server decides whether it's worth
// a notification (current week only, edits only for today/tomorrow).
export function notifyGroup(publisherId, weekStart, days) {
  if (!supabase || !publisherId || !days.length) return
  supabase.functions
    .invoke('push', { body: { action: 'notify', publisher_id: publisherId, week_start: weekStart, days } })
    .catch(err => console.warn('[push] notify failed:', err))
}
