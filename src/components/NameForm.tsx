import { useState, type FormEvent } from 'react'

/** Plain name input; replaced by ProfileForm (name + emoji) in a later ticket. */
export function NameForm({
  submitLabel,
  onSubmit,
}: {
  submitLabel: string
  onSubmit(name: string): void
}) {
  const [name, setName] = useState('')
  const trimmed = name.trim()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (trimmed) onSubmit(trimmed)
  }

  return (
    <form onSubmit={submit}>
      <label>
        Your name{' '}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          required
          autoFocus
        />
      </label>{' '}
      <button type="submit" disabled={!trimmed}>
        {submitLabel}
      </button>
    </form>
  )
}
