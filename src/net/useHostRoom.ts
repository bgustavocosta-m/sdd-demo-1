import Peer, { type DataConnection } from 'peerjs'
import { useEffect, useState } from 'react'
import { isGuestMsg, type HostMsg, type Profile } from './protocol'

export type HostPhase = 'connecting' | 'waiting' | 'connected' | 'error'

export type HostRoom = {
  phase: HostPhase
  opponent: Profile | null
  error: string | null
}

/**
 * State is per room: the caller remounts (key) on a new room id.
 * The host's Peer id *is* the room id. Default PeerJS options: public
 * signaling server and default ICE config (no `config`, no TURN).
 */
export function useHostRoom(roomId: string, profile: Profile): HostRoom {
  const [phase, setPhase] = useState<HostPhase>('connecting')
  const [opponent, setOpponent] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const peer = new Peer(roomId)
    let guest: DataConnection | null = null
    const send = (conn: DataConnection, msg: HostMsg) => conn.send(msg)

    peer.on('open', () => setPhase('waiting'))

    peer.on('connection', (conn) => {
      if (guest) {
        conn.close() // only the first connection is accepted
        return
      }
      guest = conn
      conn.on('data', (data) => {
        if (!isGuestMsg(data)) return
        if (data.type === 'hello') {
          setOpponent({ name: data.name, avatar: data.avatar })
          setPhase('connected')
          send(conn, { type: 'welcome', host: profile })
        }
      })
    })

    peer.on('error', (e) => {
      setError(e.type)
      setPhase('error')
    })

    return () => peer.destroy()
  }, [roomId, profile])

  return { phase, opponent, error }
}
