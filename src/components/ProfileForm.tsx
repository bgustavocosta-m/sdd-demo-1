import { useState, type FormEvent } from 'react'
import type { Profile } from '../net/protocol'
import { EMOJIS } from '../profile/emojis'
import { loadProfile, saveProfile } from '../profile/storage'

export const MAX_NAME = 20

/** Name + emoji grid, shared by Home ("Create room") and the room route ("Join") (#5).
 * Prefilled from the last profile saved in this browser; saves on submit. */
export function ProfileForm({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string
  onSubmit(profile: Profile): void
}) {
  const [initial] = useState(loadProfile)
  const [name, setName] = useState(initial?.name.slice(0, MAX_NAME) ?? '')
  const [avatar, setAvatar] = useState(
    initial && EMOJIS.includes(initial.avatar) ? initial.avatar : EMOJIS[0],
  )
  const trimmed = name.trim()
  const valid = trimmed.length >= 1 && trimmed.length <= MAX_NAME

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid) return
    const profile = { name: trimmed, avatar }
    saveProfile(profile)
    onSubmit(profile)
  }

  return (
    <form className="profile-form" onSubmit={submit}>
      <label className="field">
        Your name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME}
          required
          autoFocus
        />
      </label>
      <fieldset className="emoji-grid">
        <legend>Pick an avatar</legend>
        {EMOJIS.map((e) => (
          <label key={e} className="emoji-option">
            <input
              type="radio"
              name="avatar"
              value={e}
              aria-label={e}
              checked={avatar === e}
              onChange={() => setAvatar(e)}
            />
            <span aria-hidden="true">{e}</span>
          </label>
        ))}
      </fieldset>
      <button type="submit" className="primary" disabled={!valid}>
        {submitLabel}
      </button>
    </form>
  )
}
