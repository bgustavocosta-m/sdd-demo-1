import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { GameScreen } from '../components/GameScreen'
import { ProfileForm } from '../components/ProfileForm'
import { TerminalScreen, type TerminalReason } from '../components/TerminalScreen'
import { WaitingScreen } from '../components/WaitingScreen'
import type { Profile } from '../net/protocol'
import { shareUrl } from '../net/roomId'
import { useGuestRoom } from '../net/useGuestRoom'
import { useHostRoom } from '../net/useHostRoom'
import { useSession } from '../session'

const TERMINAL: readonly string[] = ['not-found', 'room-full', 'opponent-left']
const isTerminal = (phase: string): phase is TerminalReason => TERMINAL.includes(phase)

/** Room state machine (#5): profile → (connecting | waiting) → playing → game-over,
 * plus terminal not-found | room-full | opponent-left. */
export function RoomPage() {
  const { id = '' } = useParams()
  const { createdRoomId, profile } = useSession()

  // Host only if this tab created the room; everyone else is a guest.
  // The host keeps a fixed key: an `unavailable-id` retry renames the room
  // (and the URL) without remounting the hook that owns the Peer.
  return createdRoomId === id && profile ? (
    <HostRoom key="host" roomId={id} profile={profile} />
  ) : (
    <GuestRoom key={id} roomId={id} />
  )
}

function HostRoom({ roomId: initialRoomId, profile }: { roomId: string; profile: Profile }) {
  const { renameRoom } = useSession()
  const navigate = useNavigate()
  const { roomId, phase, opponent, game, move } = useHostRoom(initialRoomId, profile, (id) => {
    renameRoom(id)
    navigate(`/room/${id}`, { replace: true })
  })
  const url = shareUrl(roomId)

  if (isTerminal(phase)) return <TerminalScreen reason={phase} />

  return (
    <main data-phase={phase}>
      <h1>Room</h1>
      {phase === 'connecting' && <p>Opening room…</p>}
      {phase === 'waiting' && <WaitingScreen url={url} profile={profile} />}
      {(phase === 'playing' || phase === 'game-over') && opponent && (
        <GameScreen me={profile} opponent={opponent} myMark="X" game={game} onMove={move} />
      )}
    </main>
  )
}

function GuestRoom({ roomId }: { roomId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { phase, host, game, move } = useGuestRoom(roomId, profile)

  if (isTerminal(phase)) return <TerminalScreen reason={phase} />

  return (
    <main data-phase={profile ? phase : 'profile'}>
      <h1>Room</h1>
      {!profile && <ProfileForm submitLabel="Join" onSubmit={setProfile} />}
      {phase === 'connecting' && <p>Connecting…</p>}
      {(phase === 'playing' || phase === 'game-over') && host && game && profile && (
        <GameScreen me={profile} opponent={host} myMark="O" game={game} onMove={move} />
      )}
    </main>
  )
}
