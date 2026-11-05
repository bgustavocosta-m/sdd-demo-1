import { useNavigate } from 'react-router'

export type TerminalReason = 'not-found' | 'room-full' | 'opponent-left'

const MESSAGES: Record<TerminalReason, string> = {
  'not-found': 'Room not found',
  'room-full': 'Room full',
  'opponent-left': 'Opponent left',
}

/** Every dead end in a room: a message and a way back home (#5). */
export function TerminalScreen({ reason }: { reason: TerminalReason }) {
  const navigate = useNavigate()
  return (
    <main>
      <h1>{MESSAGES[reason]}</h1>
      <button type="button" onClick={() => navigate('/')}>
        Back to home
      </button>
    </main>
  )
}
