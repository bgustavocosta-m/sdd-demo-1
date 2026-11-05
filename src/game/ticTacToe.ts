export type Mark = 'X' | 'O'
export type Cell = Mark | null
export type Result = null | { winner: Mark } | 'draw'

export interface GameState {
  board: Cell[]
  turn: Mark
  starter: Mark
  result: Result
  winLine: number[] | null
}

export type RejectReason = 'not-your-turn' | 'occupied' | 'game-over' | 'out-of-range'
export type MoveResult = { ok: true; state: GameState } | { ok: false; reason: RejectReason }

const LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function other(mark: Mark): Mark {
  return mark === 'X' ? 'O' : 'X'
}

export function newGame(starter: Mark): GameState {
  return { board: Array(9).fill(null), turn: starter, starter, result: null, winLine: null }
}

export function checkResult(board: readonly Cell[]): { result: Result; winLine: number[] | null } {
  for (const [a, b, c] of LINES) {
    const mark = board[a]
    if (mark && mark === board[b] && mark === board[c]) {
      return { result: { winner: mark }, winLine: [a, b, c] }
    }
  }
  if (board.every((cell) => cell !== null)) return { result: 'draw', winLine: null }
  return { result: null, winLine: null }
}

export function applyMove(state: GameState, player: Mark, cell: number): MoveResult {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) return { ok: false, reason: 'out-of-range' }
  if (state.result !== null) return { ok: false, reason: 'game-over' }
  if (player !== state.turn) return { ok: false, reason: 'not-your-turn' }
  if (state.board[cell] !== null) return { ok: false, reason: 'occupied' }

  const board = state.board.slice()
  board[cell] = player
  const { result, winLine } = checkResult(board)
  return { ok: true, state: { ...state, board, turn: other(player), result, winLine } }
}
