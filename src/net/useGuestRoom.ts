import Peer from 'peerjs'
import { useEffect, useState } from 'react'
import { isHostMsg, type GuestMsg, type Profile } from './protocol'

export type GuestPhase = 'idle' | 'connecting' | 'connected' | 'error'

export type GuestRoom = {
  phase: GuestPhase
  host: Profile | null
  error: string | null
}

/** Connects to the host whose Peer id is `roomId`. Idle until `profile` is set.
 * State is per room: the caller remounts (key) on a new room id. */
export function useGuestRoom(roomId: string, profile: Profile | null): GuestRoom {
  const [phase, setPhase] = useState<GuestPhase>('connecting')
  const [host, setHost] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return

    const peer = new Peer()

    peer.on('open', () => {
      const conn = peer.connect(roomId, { reliable: true })
      conn.on('open', () => {
        const hello: GuestMsg = { type: 'hello', name: profile.name, avatar: profile.avatar }
        conn.send(hello)
      })
      conn.on('data', (data) => {
        if (!isHostMsg(data)) return
        if (data.type === 'welcome') {
          setHost(data.host)
          setPhase('connected')
        }
      })
    })

    peer.on('error', (e) => {
      setError(e.type)
      setPhase('error')
    })

    return () => peer.destroy()
  }, [roomId, profile])

  return { phase: profile ? phase : 'idle', host, error }
}
