import { expect, test } from 'vitest'
import { applyMove, newGame, type GameState, type Mark } from '../game/ticTacToe'
import { statusText } from './statusText'

function play(moves: number[]): GameState {
  let g = newGame('X')
  for (const cell of moves) {
    const r = applyMove(g, g.turn, cell)
    if (!r.ok) throw new Error(r.reason)
    g = r.state
  }
  return g
}

const say = (g: GameState, me: Mark) => statusText(g, me, 'Bea')

test('my turn / their turn', () => {
  expect(say(newGame('X'), 'X')).toBe('Your turn')
  expect(say(newGame('X'), 'O')).toBe('Waiting for Bea…')
  expect(say(play([4]), 'O')).toBe('Your turn')
  expect(say(play([4]), 'X')).toBe('Waiting for Bea…')
})

test('win is "You win" for the winner and "<name> wins" for the loser', () => {
  const xWins = play([0, 3, 1, 4, 2])
  expect(say(xWins, 'X')).toBe('You win')
  expect(say(xWins, 'O')).toBe('Bea wins')
})

test('draw', () => {
  const draw = play([0, 1, 2, 4, 3, 5, 7, 6, 8])
  expect(say(draw, 'X')).toBe('Draw')
  expect(say(draw, 'O')).toBe('Draw')
})
