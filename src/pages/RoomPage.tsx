import { useState } from 'react'
import { useParams } from 'react-router'
import { NameForm } from '../components/NameForm'
import type { Profile } from '../net/protocol'
import { shareUrl } from '../net/roomId'
import { useGuestRoom } from '../net/useGuestRoom'
import { useHostRoom } from '../net/useHostRoom'
import { useSession } from '../session'

export function RoomPage() {
  const { id = '' } = useParams()
  const { createdRoomId, profile } = useSession()

  // Host only if this tab created the room; everyone else is a guest.
  return createdRoomId === id && profile ? (
    <HostRoom key={id} roomId={id} profile={profile} />
  ) : (
    <GuestRoom key={id} roomId={id} />
  )
}

function HostRoom({ roomId, profile }: { roomId: string; profile: Profile }) {
  const { phase, opponent, error } = useHostRoom(roomId, profile)
  const url = shareUrl(roomId)

  return (
    <main>
      <h1>Room</h1>
      {phase === 'connecting' && <p>Opening room…</p>}
      {phase === 'waiting' && (
        <>
          <p>Waiting for opponent…</p>
          <p>
            Share this link: <a href={url}>{url}</a>
          </p>
        </>
      )}
      {phase === 'connected' && opponent && (
        <p data-testid="connected">
          Connected: {profile.name} vs {opponent.name}
        </p>
      )}
      {phase === 'error' && <p>Connection error: {error}</p>}
    </main>
  )
}

function GuestRoom({ roomId }: { roomId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { phase, host, error } = useGuestRoom(roomId, profile)

  return (
    <main>
      <h1>Room</h1>
      {!profile && (
        <NameForm submitLabel="Join" onSubmit={(name) => setProfile({ name, avatar: '' })} />
      )}
      {phase === 'connecting' && <p>Connecting…</p>}
      {phase === 'connected' && host && profile && (
        <p data-testid="connected">
          Connected: {host.name} vs {profile.name}
        </p>
      )}
      {phase === 'error' && <p>Connection error: {error}</p>}
    </main>
  )
}
