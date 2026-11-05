import type { GameState, Mark } from '../game/ticTacToe'

/** Status line from one player's point of view (#5). */
export function statusText(game: GameState, me: Mark, opponentName: string): string {
  if (game.result === 'draw') return 'Draw'
  if (game.result) return game.result.winner === me ? 'You win' : `${opponentName} wins`
  return game.turn === me ? 'Your turn' : `Waiting for ${opponentName}…`
}
