import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { startHeartbeat } from './heartbeat'
import { HEARTBEAT_MS, TIMEOUT_MS } from './peerConfig'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function setup() {
  const ping = vi.fn()
  const dead = vi.fn()
  const hb = startHeartbeat(ping, dead)
  return { ping, dead, hb }
}

test('pings every HEARTBEAT_MS', () => {
  const { ping, hb } = setup()
  expect(ping).not.toHaveBeenCalled()
  vi.advanceTimersByTime(HEARTBEAT_MS)
  expect(ping).toHaveBeenCalledTimes(1)
  hb.alive()
  vi.advanceTimersByTime(HEARTBEAT_MS * 2)
  expect(ping).toHaveBeenCalledTimes(3)
  hb.stop()
})

test('reports dead after TIMEOUT_MS of silence, once', () => {
  const { dead } = setup()
  vi.advanceTimersByTime(TIMEOUT_MS - 1)
  expect(dead).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(dead).toHaveBeenCalledTimes(1)
  vi.advanceTimersByTime(TIMEOUT_MS * 3)
  expect(dead).toHaveBeenCalledTimes(1)
})

test('stops pinging once dead', () => {
  const { ping } = setup()
  vi.advanceTimersByTime(TIMEOUT_MS)
  const n = ping.mock.calls.length
  vi.advanceTimersByTime(HEARTBEAT_MS * 5)
  expect(ping).toHaveBeenCalledTimes(n)
})

test('any received message resets the silence window', () => {
  const { dead, hb } = setup()
  for (let i = 0; i < 10; i++) {
    vi.advanceTimersByTime(TIMEOUT_MS - 1)
    hb.alive()
  }
  expect(dead).not.toHaveBeenCalled()
  vi.advanceTimersByTime(TIMEOUT_MS)
  expect(dead).toHaveBeenCalledTimes(1)
})

test('stop() ends pings and never reports dead', () => {
  const { ping, dead, hb } = setup()
  hb.stop()
  vi.advanceTimersByTime(TIMEOUT_MS * 5)
  expect(ping).not.toHaveBeenCalled()
  expect(dead).not.toHaveBeenCalled()
})

test('a throwing ping does not stop the heartbeat', () => {
  const dead = vi.fn()
  const ping = vi.fn(() => {
    throw new Error('not open')
  })
  const hb = startHeartbeat(ping, dead)
  vi.advanceTimersByTime(HEARTBEAT_MS * 2)
  expect(ping).toHaveBeenCalledTimes(2)
  hb.stop()
})
