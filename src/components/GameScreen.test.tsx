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
  render(<GameScreen me={me} opponent={bea} myMark="X" game={newGame('X')} onMove={onMove} />)
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
  render(<GameScreen me={bea} opponent={me} myMark="O" game={newGame('X')} onMove={onMove} />)
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
  render(<GameScreen me={bea} opponent={me} myMark="O" game={g} onMove={onMove} />)
  expect(status()).toBe('Ana wins')
  fireEvent.click(cells()[8])
  expect(onMove).not.toHaveBeenCalled()
})
