import { useState } from 'react'
import { useParams } from 'react-router'
import { GameScreen } from '../components/GameScreen'
import { NameForm } from '../components/NameForm'
import type { Profile } from '../net/protocol'
import { shareUrl } from '../net/roomId'
import { useGuestRoom } from '../net/useGuestRoom'
import { useHostRoom } from '../net/useHostRoom'
import { useSession } from '../session'

/** Room state machine (#5): profile → (connecting | waiting) → playing → game-over. */
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
  const { phase, opponent, game, move, error } = useHostRoom(roomId, profile)
  const url = shareUrl(roomId)

  return (
    <main data-phase={phase}>
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
      {(phase === 'playing' || phase === 'game-over') && opponent && (
        <GameScreen me={profile} opponent={opponent} myMark="X" game={game} onMove={move} />
      )}
      {phase === 'error' && <p>Connection error: {error}</p>}
    </main>
  )
}

function GuestRoom({ roomId }: { roomId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { phase, host, game, move, error } = useGuestRoom(roomId, profile)

  return (
    <main data-phase={profile ? phase : 'profile'}>
      <h1>Room</h1>
      {!profile && (
        <NameForm submitLabel="Join" onSubmit={(name) => setProfile({ name, avatar: '' })} />
      )}
      {phase === 'connecting' && <p>Connecting…</p>}
      {(phase === 'playing' || phase === 'game-over') && host && game && profile && (
        <GameScreen me={profile} opponent={host} myMark="O" game={game} onMove={move} />
      )}
      {phase === 'error' && <p>Connection error: {error}</p>}
    </main>
  )
}
