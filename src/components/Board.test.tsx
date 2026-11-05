import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { Board } from './Board'

afterEach(cleanup)

const cells = () => screen.getAllByRole('button', { name: /^Cell/ })

test('Board renders 9 cells and calls onMove with the index', () => {
  const onMove = vi.fn()
  render(<Board board={Array(9).fill(null)} winLine={null} onMove={onMove} />)
  expect(cells()).toHaveLength(9)
  fireEvent.click(cells()[4])
  expect(onMove).toHaveBeenCalledWith(4)
})

test('Board highlights the win line', () => {
  render(<Board board={['X', 'X', 'X', 'O', 'O', null, null, null, null]} winLine={[0, 1, 2]} onMove={() => {}} />)
  expect(cells().filter((c) => c.className.includes('cell--win'))).toHaveLength(3)
})
