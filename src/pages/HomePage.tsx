import { useState } from 'react'
import { Board } from '../components/Board'
import { StatusLine } from '../components/StatusLine'
import { applyMove, newGame } from '../game/ticTacToe'

export function HomePage() {
  // Temporary hot-seat board until the online flow lands.
  const [game, setGame] = useState(() => newGame('X'))

  function handleMove(cell: number) {
    const r = applyMove(game, game.turn, cell)
    if (r.ok) setGame(r.state)
  }

  return (
    <main>
      <h1>Tic-tac-toe</h1>
      <p>Home</p>
      <StatusLine game={game} />
      <Board board={game.board} winLine={game.winLine} onMove={handleMove} />
    </main>
  )
}
