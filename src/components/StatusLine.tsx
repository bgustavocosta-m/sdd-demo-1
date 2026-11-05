import type { GameState } from '../game/ticTacToe'
import { statusText } from './statusText'

export function StatusLine({ game }: { game: GameState }) {
  return (
    <p className="status" role="status">
      {statusText(game)}
    </p>
  )
}
