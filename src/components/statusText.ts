import type { GameState } from '../game/ticTacToe'

export function statusText(game: GameState): string {
  if (game.result === 'draw') return 'Draw'
  if (game.result) return `${game.result.winner} wins`
  return `${game.turn}'s turn`
}
