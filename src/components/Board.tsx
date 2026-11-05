import type { Cell } from '../game/ticTacToe'
import './Board.css'

interface BoardProps {
  board: Cell[]
  winLine: number[] | null
  onMove: (cell: number) => void
}

export function Board({ board, winLine, onMove }: BoardProps) {
  return (
    <div className="board" role="grid" aria-label="Tic-tac-toe board">
      {board.map((cell, i) => (
        <button
          key={i}
          type="button"
          className={`cell${winLine?.includes(i) ? ' cell--win' : ''}`}
          aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
          onClick={() => onMove(i)}
        >
          {cell}
        </button>
      ))}
    </div>
  )
}
