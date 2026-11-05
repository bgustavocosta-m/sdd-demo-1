import { useEffect, useState } from 'react'
import type { Profile } from '../net/protocol'

const COPIED_MS = 2000

/** The host's screen until a guest says hello (#5). */
export function WaitingScreen({ url, profile }: { url: string; profile: Profile }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // No clipboard access (insecure context, denied): the URL is still selectable.
    }
  }

  return (
    <section className="waiting" aria-label="Waiting">
      <div className="big-avatar" aria-hidden="true">
        {profile.avatar}
      </div>
      <p className="player-name">{profile.name}</p>
      <p>Waiting for opponent…</p>
      <div className="share">
        <input
          readOnly
          value={url}
          aria-label="Share link"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button type="button" className="primary" onClick={copy}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
    </section>
  )
}
