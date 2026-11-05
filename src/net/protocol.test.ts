import { describe, expect, test } from 'vitest'
import { isGuestMsg, isHostMsg, isProfile } from './protocol'

const profile = { name: 'Ana', avatar: '🦊' }

describe('isProfile', () => {
  test('accepts {name, avatar} strings', () => {
    expect(isProfile(profile)).toBe(true)
  })
  test.each([
    null,
    undefined,
    'Ana',
    {},
    { name: 'Ana' },
    { avatar: '🦊' },
    { name: 1, avatar: '🦊' },
    { name: 'Ana', avatar: null },
  ])('rejects %j', (v) => {
    expect(isProfile(v)).toBe(false)
  })
})

describe('isGuestMsg', () => {
  test.each([
    { type: 'hello', name: 'Ana', avatar: '🦊' },
    { type: 'move', cell: 0 },
    { type: 'move', cell: 8 },
    { type: 'rematch' },
    { type: 'ping' },
  ])('accepts %j', (m) => {
    expect(isGuestMsg(m)).toBe(true)
  })

  test.each([
    null,
    42,
    'hello',
    [],
    {},
    { type: 'nope' },
    { type: 'hello' },
    { type: 'hello', name: 'Ana' },
    { type: 'hello', name: 3, avatar: '🦊' },
    { type: 'move' },
    { type: 'move', cell: '1' },
    { type: 'move', cell: 1.5 },
    { type: 'welcome', host: profile },
    { type: 'room-full' },
  ])('rejects %j', (m) => {
    expect(isGuestMsg(m)).toBe(false)
  })
})

describe('isHostMsg', () => {
  const state = {
    type: 'state',
    board: [null, 'X', 'O', null, null, null, null, null, null],
    turn: 'X',
    starter: 'X',
    result: null,
    winLine: null,
  }

  test.each([
    { type: 'welcome', host: profile },
    state,
    { ...state, result: 'draw' },
    { ...state, result: { winner: 'O' }, winLine: [0, 4, 8] },
    { type: 'room-full' },
    { type: 'ping' },
  ])('accepts %j', (m) => {
    expect(isHostMsg(m)).toBe(true)
  })

  test.each([
    null,
    {},
    { type: 'welcome' },
    { type: 'welcome', host: { name: 'Ana' } },
    { ...state, board: [] },
    { ...state, board: Array(9).fill('Z') },
    { ...state, turn: 'Y' },
    { ...state, starter: null },
    { ...state, result: 'win' },
    { ...state, result: { winner: 'Q' } },
    { ...state, winLine: [0, 1] },
    { ...state, winLine: 'abc' },
    { type: 'hello', name: 'Ana', avatar: '🦊' },
    { type: 'move', cell: 1 },
  ])('rejects %j', (m) => {
    expect(isHostMsg(m)).toBe(false)
  })
})
