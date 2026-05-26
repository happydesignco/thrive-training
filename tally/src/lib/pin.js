// PIN hashing. NOT a security boundary — kids and parent share a device.
// The hash just prevents another kid from peeking at the DB row and reading a sibling's PIN.

export async function hashPin(pin) {
  const data = new TextEncoder().encode(String(pin).trim())
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function pinMatches(pin, hash) {
  const h = await hashPin(pin)
  return h === hash
}

export function isValidPin(pin) {
  return /^[0-9]{4,6}$/.test(String(pin).trim())
}
