import { useState } from 'react'
import { applyMove, newGame } from '../game/ticTacToe'
import { Board } from './Board'
import { StatusLine } from './StatusLine'

/** Temporary local two-player board until online play lands. */
export function HotSeatGame() {
  const [game, setGame] = useState(() => newGame('X'))

  function handleMove(cell: number) {
    const r = applyMove(game, game.turn, cell)
    if (r.ok) setGame(r.state)
  }

  return (
    <section aria-label="Hot-seat game">
      <StatusLine game={game} />
      <Board board={game.board} winLine={game.winLine} onMove={handleMove} />
    </section>
  )
}
