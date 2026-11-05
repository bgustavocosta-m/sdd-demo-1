import { afterEach, expect, test, vi } from 'vitest'
import { loadProfile, PROFILE_KEY, saveProfile } from './storage'

afterEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

test('round-trips under ttt.profile as JSON {name, avatar}', () => {
  saveProfile({ name: 'Ana', avatar: '🦊' })
  expect(PROFILE_KEY).toBe('ttt.profile')
  expect(JSON.parse(localStorage.getItem('ttt.profile')!)).toEqual({ name: 'Ana', avatar: '🦊' })
  expect(loadProfile()).toEqual({ name: 'Ana', avatar: '🦊' })
})

test('nothing stored → null', () => {
  expect(loadProfile()).toBeNull()
})

test('malformed JSON or shape → null', () => {
  localStorage.setItem('ttt.profile', '{nope')
  expect(loadProfile()).toBeNull()
  localStorage.setItem('ttt.profile', JSON.stringify({ name: 3 }))
  expect(loadProfile()).toBeNull()
})

test('storage that throws is swallowed', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(loadProfile()).toBeNull()
  expect(() => saveProfile({ name: 'Ana', avatar: '🦊' })).not.toThrow()
})
