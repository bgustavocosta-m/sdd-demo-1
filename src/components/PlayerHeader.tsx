import { other, type Mark } from '../game/ticTacToe'
import type { Profile } from '../net/protocol'

/** Both players (emoji, name, mark). `turn` is the mark to play, or null when
 * the game is over; that player is highlighted. */
export function PlayerHeader({
  me,
  opponent,
  myMark,
  turn,
}: {
  me: Profile
  opponent: Profile
  myMark: Mark
  turn: Mark | null
}) {
  const players: [Profile, Mark][] = [
    [me, myMark],
    [opponent, other(myMark)],
  ]
  return (
    <header className="players">
      {players.map(([p, mark]) => (
        <div
          key={mark}
          className={`player${turn === mark ? ' player--turn' : ''}`}
          aria-current={turn === mark ? 'true' : undefined}
        >
          <span className="player-avatar" aria-hidden="true">
            {p.avatar}
          </span>
          <span className="player-name">{p.name}</span>
          <span className="player-mark">{mark}</span>
        </div>
      ))}
    </header>
  )
}
