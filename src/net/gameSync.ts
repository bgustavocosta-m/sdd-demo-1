import type { GameState } from '../game/ticTacToe'
import type { HostMsg } from './protocol'

export type StateMsg = Extract<HostMsg, { type: 'state' }>

/** The full snapshot the host sends after every change (#4). */
export function stateMsg(g: GameState): StateMsg {
  return { type: 'state', board: g.board, turn: g.turn, starter: g.starter, result: g.result, winLine: g.winLine }
}

/** What the guest renders: built only from a `state` snapshot. */
export function gameFromState(m: StateMsg): GameState {
  return { board: m.board, turn: m.turn, starter: m.starter, result: m.result, winLine: m.winLine }
}
