import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, expect, test } from 'vitest'
import { TerminalScreen, type TerminalReason } from './TerminalScreen'

afterEach(cleanup)

function renderAt(reason: TerminalReason) {
  render(
    <MemoryRouter initialEntries={['/room/ttt-abc0123456']}>
      <Routes>
        <Route path="/" element={<p>home page</p>} />
        <Route path="/room/:id" element={<TerminalScreen reason={reason} />} />
      </Routes>
    </MemoryRouter>,
  )
}

test.each([
  ['not-found', 'Room not found'],
  ['room-full', 'Room full'],
  ['opponent-left', 'Opponent left'],
] as const)('%s shows "%s"', (reason, text) => {
  renderAt(reason)
  expect(screen.getByRole('heading', { name: text })).toBeTruthy()
})

test('Back to home goes to #/', () => {
  renderAt('opponent-left')
  fireEvent.click(screen.getByRole('button', { name: 'Back to home' }))
  expect(screen.getByText('home page')).toBeTruthy()
})
