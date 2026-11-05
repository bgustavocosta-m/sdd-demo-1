import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { EMOJIS } from '../profile/emojis'
import { saveProfile } from '../profile/storage'
import { ProfileForm } from './ProfileForm'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

const nameInput = () => screen.getByLabelText('Your name') as HTMLInputElement
const submit = () => screen.getByRole('button', { name: 'Go' }) as HTMLButtonElement
const emoji = (e: string) => screen.getByRole('radio', { name: e }) as HTMLInputElement

test('shows a name input and all 16 emojis, the first selected by default', () => {
  render(<ProfileForm submitLabel="Go" onSubmit={() => {}} />)
  expect(nameInput().value).toBe('')
  expect(screen.getAllByRole('radio')).toHaveLength(16)
  expect(emoji(EMOJIS[0]).checked).toBe(true)
})

test('name is required: blank or whitespace keeps submit disabled', () => {
  const onSubmit = vi.fn()
  render(<ProfileForm submitLabel="Go" onSubmit={onSubmit} />)
  expect(submit().disabled).toBe(true)
  fireEvent.change(nameInput(), { target: { value: '   ' } })
  expect(submit().disabled).toBe(true)
  fireEvent.submit(submit().form!)
  expect(onSubmit).not.toHaveBeenCalled()
})

test('submits the trimmed name and chosen emoji, and saves it', () => {
  const onSubmit = vi.fn()
  render(<ProfileForm submitLabel="Go" onSubmit={onSubmit} />)
  fireEvent.change(nameInput(), { target: { value: '  Ana  ' } })
  fireEvent.click(emoji(EMOJIS[5]))
  fireEvent.click(submit())
  expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana', avatar: EMOJIS[5] })
  expect(JSON.parse(localStorage.getItem('ttt.profile')!)).toEqual({ name: 'Ana', avatar: EMOJIS[5] })
})

test('name is capped at 20 characters', () => {
  render(<ProfileForm submitLabel="Go" onSubmit={() => {}} />)
  expect(nameInput().maxLength).toBe(20)
})

test('prefills from the last saved profile', () => {
  saveProfile({ name: 'Bea', avatar: EMOJIS[3] })
  render(<ProfileForm submitLabel="Go" onSubmit={() => {}} />)
  expect(nameInput().value).toBe('Bea')
  expect(emoji(EMOJIS[3]).checked).toBe(true)
})

test('a saved emoji outside the set falls back to the first', () => {
  saveProfile({ name: 'Bea', avatar: 'zz' })
  render(<ProfileForm submitLabel="Go" onSubmit={() => {}} />)
  expect(emoji(EMOJIS[0]).checked).toBe(true)
})
