import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { applyMove, newGame } from '../game/ticTacToe'
import { GameScreen } from './GameScreen'

afterEach(cleanup)

const cells = () => screen.getAllByRole('button', { name: /^Cell/ })
const status = () => screen.getByRole('status').textContent
const me = { name: 'Ana', avatar: '' }
const bea = { name: 'Bea', avatar: '' }

test('on my turn, clicking a cell calls onMove', () => {
  const onMove = vi.fn()
  render(<GameScreen me={me} opponent={bea} myMark="X" game={newGame('X')} onMove={onMove} onRematch={() => {}} />)
  expect(status()).toBe('Your turn')
  fireEvent.click(cells()[4])
  expect(onMove).toHaveBeenCalledWith(4)
})

test('the header shows both players and highlights whose turn it is', () => {
  render(
    <GameScreen
      me={{ name: 'Ana', avatar: '🦊' }}
      opponent={{ name: 'Bea', avatar: '🐼' }}
      myMark="O"
      game={newGame('X')}
      onMove={() => {}}
    />,
  )
  const turn = document.querySelector('[aria-current="true"]')!
  expect(turn.textContent).toBe('🐼BeaX')
  expect(screen.getByText('Ana').closest('.player')!.textContent).toBe('🦊AnaO')
})

test('out of turn, clicking does nothing', () => {
  const onMove = vi.fn()
  render(<GameScreen me={bea} opponent={me} myMark="O" game={newGame('X')} onMove={onMove} onRematch={() => {}} />)
  expect(status()).toBe('Waiting for Ana…')
  fireEvent.click(cells()[4])
  expect(onMove).not.toHaveBeenCalled()
})

test('after the game ends, clicking does nothing', () => {
  let g = newGame('X')
  for (const c of [0, 3, 1, 4, 2]) {
    const r = applyMove(g, g.turn, c)
    if (r.ok) g = r.state
  }
  const onMove = vi.fn()
  render(<GameScreen me={bea} opponent={me} myMark="O" game={g} onMove={onMove} onRematch={() => {}} />)
  expect(status()).toBe('Ana wins')
  fireEvent.click(cells()[8])
  expect(onMove).not.toHaveBeenCalled()
})

const wonByX = () => {
  let g = newGame('X')
  for (const c of [0, 3, 1, 4, 2]) {
    const r = applyMove(g, g.turn, c)
    if (r.ok) g = r.state
  }
  return g
}
const rematchButton = () => screen.queryByRole('button', { name: 'Rematch' })

test('Rematch is hidden while the game is in progress', () => {
  render(<GameScreen me={me} opponent={bea} myMark="X" game={newGame('X')} onMove={() => {}} onRematch={() => {}} />)
  expect(rematchButton()).toBeNull()
})

test.each(['X', 'O'] as const)('on game over, %s sees Rematch and pressing it calls onRematch', (myMark) => {
  const onRematch = vi.fn()
  render(<GameScreen me={me} opponent={bea} myMark={myMark} game={wonByX()} onMove={() => {}} onRematch={onRematch} />)
  fireEvent.click(rematchButton()!)
  expect(onRematch).toHaveBeenCalledOnce()
})

test('on a win, the winning cells are highlighted', () => {
  render(<GameScreen me={me} opponent={bea} myMark="O" game={wonByX()} onMove={() => {}} onRematch={() => {}} />)
  const highlighted = cells().flatMap((c, i) => (c.classList.contains('cell--win') ? [i] : []))
  expect(highlighted).toEqual([0, 1, 2])
})
