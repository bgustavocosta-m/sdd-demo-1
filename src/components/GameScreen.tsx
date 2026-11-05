import type { GameState, Mark } from '../game/ticTacToe'
import type { Profile } from '../net/protocol'
import { Board } from './Board'
import { PlayerHeader } from './PlayerHeader'
import { statusText } from './statusText'

interface GameScreenProps {
  me: Profile
  opponent: Profile
  myMark: Mark
  game: GameState
  onMove(cell: number): void
}

export function GameScreen({ me, opponent, myMark, game, onMove }: GameScreenProps) {
  const myTurn = game.result === null && game.turn === myMark
  return (
    <section aria-label="Game">
      <PlayerHeader
        me={me}
        opponent={opponent}
        myMark={myMark}
        turn={game.result === null ? game.turn : null}
      />
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
    </section>
  )
}
