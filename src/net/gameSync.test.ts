import { expect, test } from 'vitest'
import { applyMove, newGame } from '../game/ticTacToe'
import { isHostMsg } from './protocol'
import { gameFromState, stateMsg } from './gameSync'

test('stateMsg is a valid host `state` message and round-trips', () => {
  const r = applyMove(newGame('X'), 'X', 4)
  if (!r.ok) throw new Error()
  const msg = stateMsg(r.state)
  expect(msg).toEqual({ type: 'state', ...r.state })
  expect(isHostMsg(msg)).toBe(true)
  expect(gameFromState(msg)).toEqual(r.state)
})

test('gameFromState drops extra fields', () => {
  const g = newGame('X')
  const withExtra = { ...stateMsg(g), junk: 1 } as ReturnType<typeof stateMsg>
  expect(gameFromState(withExtra)).toEqual(g)
})
