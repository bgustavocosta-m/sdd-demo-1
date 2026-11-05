import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { PlayerHeader } from './PlayerHeader'

afterEach(cleanup)

const ana = { name: 'Ana', avatar: '🦊' }
const bea = { name: 'Bea', avatar: '🐼' }
const player = (name: string) => screen.getByText(name).closest('.player')!

test('shows both players with emoji, name and mark', () => {
  render(<PlayerHeader me={ana} opponent={bea} myMark="X" turn="X" />)
  expect(player('Ana').textContent).toContain('🦊')
  expect(player('Ana').textContent).toContain('X')
  expect(player('Bea').textContent).toContain('🐼')
  expect(player('Bea').textContent).toContain('O')
})

test('highlights whose turn it is', () => {
  const { rerender } = render(<PlayerHeader me={ana} opponent={bea} myMark="O" turn="X" />)
  expect(player('Bea').getAttribute('aria-current')).toBe('true')
  expect(player('Ana').getAttribute('aria-current')).toBeNull()
  rerender(<PlayerHeader me={ana} opponent={bea} myMark="O" turn="O" />)
  expect(player('Ana').getAttribute('aria-current')).toBe('true')
})

test('no highlight once the game is over', () => {
  render(<PlayerHeader me={ana} opponent={bea} myMark="X" turn={null} />)
  expect(document.querySelector('[aria-current]')).toBeNull()
})
