import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Profile } from './net/protocol'

/**
 * In-memory only (#5): the tab that pressed "Create room" is the host of that
 * room. A refresh or any other tab opening the link is a guest.
 */
type Session = {
  createdRoomId: string | null
  profile: Profile | null
  createRoom(roomId: string, profile: Profile): void
  /** The host's Peer got a different id (`unavailable-id` retry). */
  renameRoom(roomId: string): void
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const createRoom = (roomId: string, p: Profile) => {
    setCreatedRoomId(roomId)
    setProfile(p)
  }
  const renameRoom = (roomId: string) => setCreatedRoomId(roomId)
  return (
    <SessionContext value={{ createdRoomId, profile, createRoom, renameRoom }}>{children}</SessionContext>
  )
}

export function useSession(): Session {
  const s = useContext(SessionContext)
  if (!s) throw new Error('useSession outside SessionProvider')
  return s
}
