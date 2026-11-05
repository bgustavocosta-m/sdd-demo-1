import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { WaitingScreen } from './WaitingScreen'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const url = 'https://x.test/sdd-demo-1/#/room/ttt-abc0123456'

test('shows waiting text, host avatar and share URL', () => {
  render(<WaitingScreen url={url} profile={{ name: 'Ana', avatar: '🦊' }} />)
  expect(screen.getByText('Waiting for opponent…')).toBeTruthy()
  expect(screen.getByText('🦊')).toBeTruthy()
  expect(screen.getByDisplayValue(url)).toBeTruthy()
})

test('Copy link writes the URL and shows Copied! for ~2s', async () => {
  vi.useFakeTimers()
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
  render(<WaitingScreen url={url} profile={{ name: 'Ana', avatar: '🦊' }} />)

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }))
  })
  expect(writeText).toHaveBeenCalledWith(url)
  expect(screen.getByRole('button').textContent).toBe('Copied!')

  act(() => vi.advanceTimersByTime(2000))
  expect(screen.getByRole('button').textContent).toBe('Copy link')
})
