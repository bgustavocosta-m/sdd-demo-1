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

test('/ shows a name input and Create room', () => {
  renderAt('/')
  expect(screen.getByLabelText('Your name')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Create room' })).toBeTruthy()
})

test('/room/:id without a profile shows a name input and Join', () => {
  renderAt('/room/ttt-abc0123456')
  expect(screen.getByLabelText('Your name')).toBeTruthy()
  expect(screen.getByRole('button', { name: 'Join' })).toBeTruthy()
})
