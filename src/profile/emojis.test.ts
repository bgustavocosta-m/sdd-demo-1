import { expect, test } from 'vitest'
import { EMOJIS } from './emojis'

test('16 distinct emojis', () => {
  expect(EMOJIS).toHaveLength(16)
  expect(new Set(EMOJIS).size).toBe(16)
})
