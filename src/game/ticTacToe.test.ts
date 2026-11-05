import { describe, expect, test } from 'vitest'
import { applyMove, checkResult, newGame, rematch, type Cell, type GameState, type Mark } from './ticTacToe'

function boardWith(cells: number[], mark: Mark): Cell[] {
  const board: Cell[] = Array(9).fill(null)
  for (const c of cells) board[c] = mark
  return board
}

function play(state: GameState, moves: number[]): GameState {
  for (const cell of moves) {
    const r = applyMove(state, state.turn, cell)
    if (!r.ok) throw new Error(`move ${cell} rejected: ${r.reason}`)
    state = r.state
  }
  return state
}

describe('newGame', () => {
  test('starts empty with the starter to move', () => {
    const g = newGame('O')
    expect(g.board).toEqual(Array(9).fill(null))
    expect(g.turn).toBe('O')
    expect(g.starter).toBe('O')
    expect(g.result).toBeNull()
    expect(g.winLine).toBeNull()
  })
})

describe('checkResult', () => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
  test.each(lines)('line %i-%i-%i wins with that winLine', (...line) => {
    for (const mark of ['X', 'O'] as const) {
      expect(checkResult(boardWith(line, mark))).toEqual({ result: { winner: mark }, winLine: line })
    }
  })

  test('empty board is still in play', () => {
    expect(checkResult(Array(9).fill(null))).toEqual({ result: null, winLine: null })
  })

  test('full board with no line is a draw', () => {
    // X O X / X O O / O X X
    const board: Cell[] = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']
    expect(checkResult(board)).toEqual({ result: 'draw', winLine: null })
  })

  test('a full board with a line is a win, not a draw', () => {
    // X X X / O O X / X O O
    const board: Cell[] = ['X', 'X', 'X', 'O', 'O', 'X', 'X', 'O', 'O']
    expect(checkResult(board)).toEqual({ result: { winner: 'X' }, winLine: [0, 1, 2] })
  })
})

describe('applyMove', () => {
  test('turns alternate', () => {
    let g = newGame('X')
    g = play(g, [0])
    expect(g.board[0]).toBe('X')
    expect(g.turn).toBe('O')
    g = play(g, [4])
    expect(g.board[4]).toBe('O')
    expect(g.turn).toBe('X')
  })

  test('does not mutate the input state', () => {
    const g = newGame('X')
    applyMove(g, 'X', 0)
    expect(g.board[0]).toBeNull()
    expect(g.turn).toBe('X')
  })

  test('a win on the final (9th) move counts as a win', () => {
    // X O X / O O X / O X X — X completes 2-5-8 with the 9th move
    const g = play(newGame('X'), [0, 1, 2, 4, 5, 3, 7, 6, 8])
    expect(g.board.every((c) => c !== null)).toBe(true)
    expect(g.result).toEqual({ winner: 'X' })
    expect(g.winLine).toEqual([2, 5, 8])
  })

  test('a winning move ends the game with winLine', () => {
    const g = play(newGame('X'), [0, 3, 1, 4, 2])
    expect(g.result).toEqual({ winner: 'X' })
    expect(g.winLine).toEqual([0, 1, 2])
  })

  test('rejects not-your-turn', () => {
    expect(applyMove(newGame('X'), 'O', 0)).toEqual({ ok: false, reason: 'not-your-turn' })
  })

  test('rejects occupied', () => {
    const g = play(newGame('X'), [0])
    expect(applyMove(g, 'O', 0)).toEqual({ ok: false, reason: 'occupied' })
  })

  test('rejects game-over', () => {
    const g = play(newGame('X'), [0, 3, 1, 4, 2])
    expect(applyMove(g, g.turn, 8)).toEqual({ ok: false, reason: 'game-over' })
    expect(applyMove(g, 'X', 8)).toEqual({ ok: false, reason: 'game-over' })
  })

  test.each([-1, 9, 1.5, Number.NaN])('rejects out-of-range cell %s', (cell) => {
    expect(applyMove(newGame('X'), 'X', cell)).toEqual({ ok: false, reason: 'out-of-range' })
  })
})

describe('rematch', () => {
  const play = (g: GameState, cells: number[]) =>
    cells.reduce((s, c) => {
      const r = applyMove(s, s.turn, c)
      if (!r.ok) throw new Error(r.reason)
      return r.state
    }, g)

  test('clears the board and result, flips the starter, and gives the new starter the turn', () => {
    const won = play(newGame('X'), [0, 3, 1, 4, 2])
    expect(won.result).toEqual({ winner: 'X' })
    const next = rematch(won)
    expect(next).toEqual({
      board: Array(9).fill(null),
      turn: 'O',
      starter: 'O',
      result: null,
      winLine: null,
    })
  })

  test('the starter alternates X, O, X across games', () => {
    const g1 = newGame('X')
    const g2 = rematch(play(g1, [0, 3, 1, 4, 2]))
    const g3 = rematch(play(g2, [0, 3, 1, 4, 2]))
    expect([g1.starter, g2.starter, g3.starter]).toEqual(['X', 'O', 'X'])
    expect(g3.turn).toBe('X')
  })

  test('does not mutate the old state', () => {
    const won = play(newGame('X'), [0, 3, 1, 4, 2])
    const copy = structuredClone(won)
    rematch(won)
    expect(won).toEqual(copy)
  })
})
