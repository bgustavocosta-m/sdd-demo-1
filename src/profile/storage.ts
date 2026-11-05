import { isProfile, type Profile } from '../net/protocol'

export const PROFILE_KEY = 'ttt.profile'

/** The last name + emoji used in this browser, or null. Never throws:
 * storage can be blocked (private mode, disabled cookies) or hold junk. */
export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (raw === null) return null
    const v: unknown = JSON.parse(raw)
    return isProfile(v) ? { name: v.name, avatar: v.avatar } : null
  } catch {
    return null
  }
}

export function saveProfile(p: Profile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: p.name, avatar: p.avatar }))
  } catch {
    // Remembering is a convenience; a blocked store just means no prefill.
  }
}
