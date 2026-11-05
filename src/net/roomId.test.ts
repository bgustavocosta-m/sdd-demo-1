import { afterEach, expect, test, vi } from 'vitest'
import { newRoomId, shareUrl } from './roomId'

// PeerJS 1.5.5 lib/utils/validateId.ts
const PEERJS_ID = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/

test('newRoomId is ttt- plus 10 [a-z0-9] characters', () => {
  for (let i = 0; i < 200; i++) {
    expect(newRoomId()).toMatch(/^ttt-[a-z0-9]{10}$/)
  }
})

test('newRoomId passes the PeerJS id validator', () => {
  for (let i = 0; i < 200; i++) {
    expect(newRoomId()).toMatch(PEERJS_ID)
  }
})

test('newRoomId does not repeat', () => {
  const ids = new Set(Array.from({ length: 1000 }, newRoomId))
  expect(ids.size).toBe(1000)
})

test('shareUrl is origin + BASE_URL + #/room/<id>', () => {
  expect(shareUrl('ttt-abc0123456')).toBe(
    `${location.origin}${import.meta.env.BASE_URL}#/room/ttt-abc0123456`,
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
})

test('shareUrl includes the Pages base path', () => {
  vi.stubEnv('BASE_URL', '/sdd-demo-1/')
  expect(shareUrl('ttt-abc0123456')).toBe(
    `${location.origin}/sdd-demo-1/#/room/ttt-abc0123456`,
  )
})
