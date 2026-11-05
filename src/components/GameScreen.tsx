import type { GameState, Mark } from '../game/ticTacToe'
import type { Profile } from '../net/protocol'
import { Board } from './Board'
import { statusText } from './statusText'

interface GameScreenProps {
  me: Profile
  opponent: Profile
  myMark: Mark
  game: GameState
  onMove(cell: number): void
  onRematch(): void
}

export function GameScreen({ me, opponent, myMark, game, onMove, onRematch }: GameScreenProps) {
  const myTurn = game.result === null && game.turn === myMark
  const theirMark = myMark === 'X' ? 'O' : 'X'
  return (
    <section aria-label="Game">
      <p>
        {me.name} ({myMark}) vs {opponent.name} ({theirMark})
      </p>
      <p className="status" role="status">
        {statusText(game, myMark, opponent.name)}
      </p>
      <Board
        board={game.board}
        winLine={game.winLine}
        onMove={(cell) => {
          if (myTurn && game.board[cell] === null) onMove(cell)
        }}
      />
      {game.result !== null && (
        <button type="button" onClick={onRematch}>
          Rematch
        </button>
      )}
    </section>
  )
}
