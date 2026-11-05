import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { HotSeatGame } from './HotSeatGame'
import { Board } from './Board'

afterEach(cleanup)

const cells = () => screen.getAllByRole('button', { name: /^Cell/ })
const status = () => screen.getByRole('status').textContent

test('Board renders 9 cells and calls onMove with the index', () => {
  const onMove = vi.fn()
  render(<Board board={Array(9).fill(null)} winLine={null} onMove={onMove} />)
  expect(cells()).toHaveLength(9)
  fireEvent.click(cells()[4])
  expect(onMove).toHaveBeenCalledWith(4)
})

test('hot-seat game on plays to a win and ignores clicks after', () => {
  render(<HotSeatGame />)
  expect(status()).toBe("X's turn")
  for (const i of [0, 3, 1, 4]) fireEvent.click(cells()[i])
  expect(status()).toBe("X's turn")
  fireEvent.click(cells()[3]) // taken: ignored
  expect(cells()[3].textContent).toBe('O')
  expect(status()).toBe("X's turn")
  fireEvent.click(cells()[2])
  expect(status()).toBe('X wins')
  fireEvent.click(cells()[8]) // game over: ignored
  expect(cells()[8].textContent).toBe('')
  expect(cells().filter((c) => c.className.includes('cell--win'))).toHaveLength(3)
})

test('hot-seat game on plays to O wins and to a draw', () => {
  render(<HotSeatGame />)
  for (const i of [0, 3, 1, 4, 8, 5]) fireEvent.click(cells()[i])
  expect(status()).toBe('O wins')
  cleanup()
  render(<HotSeatGame />)
  for (const i of [0, 1, 2, 4, 3, 5, 7, 6]) fireEvent.click(cells()[i])
  expect(status()).toBe("X's turn")
  fireEvent.click(cells()[8])
  expect(status()).toBe('Draw')
})
