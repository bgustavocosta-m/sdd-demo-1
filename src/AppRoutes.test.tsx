import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test } from 'vitest'
import { AppRoutes } from './AppRoutes'

afterEach(cleanup)

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

test('/ renders the home placeholder', () => {
  renderAt('/')
  expect(screen.getByText('Home')).toBeTruthy()
})

test('/room/:id renders the room placeholder with the id', () => {
  renderAt('/room/abc')
  expect(screen.getByTestId('room-id').textContent).toBe('abc')
})
