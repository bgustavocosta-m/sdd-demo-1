import Peer, { type DataConnection } from 'peerjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameState } from '../game/ticTacToe'
import { gameFromState } from './gameSync'
import { isHostMsg, type GuestMsg, type Profile } from './protocol'

export type GuestPhase = 'idle' | 'connecting' | 'playing' | 'game-over' | 'error'

export type GuestRoom = {
  phase: GuestPhase
  host: Profile | null
  game: GameState | null
  move(cell: number): void
  error: string | null
}

/** Connects to the host whose Peer id is `roomId`. Idle until `profile` is set.
 * State is per room: the caller remounts (key) on a new room id.
 * The guest renders only from the host's `state` snapshots (#4); `move` just
 * sends an intent that the host validates. */
export function useGuestRoom(roomId: string, profile: Profile | null): GuestRoom {
  const [phase, setPhase] = useState<'connecting' | 'error'>('connecting')
  const [host, setHost] = useState<Profile | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const connRef = useRef<DataConnection | null>(null)

  useEffect(() => {
    if (!profile) return

    const peer = new Peer()

    peer.on('open', () => {
      const conn = peer.connect(roomId, { reliable: true })
      conn.on('open', () => {
        connRef.current = conn
        const hello: GuestMsg = { type: 'hello', name: profile.name, avatar: profile.avatar }
        conn.send(hello)
      })
      conn.on('data', (data) => {
        if (!isHostMsg(data)) return
        if (data.type === 'welcome') setHost(data.host)
        else if (data.type === 'state') setGame(gameFromState(data))
      })
    })

    peer.on('error', (e) => {
      setError(e.type)
      setPhase('error')
    })

    return () => {
      connRef.current = null
      peer.destroy()
    }
  }, [roomId, profile])

  const move = useCallback((cell: number) => {
    const msg: GuestMsg = { type: 'move', cell }
    connRef.current?.send(msg)
  }, [])

  const roomPhase: GuestPhase = !profile
    ? 'idle'
    : phase === 'error'
      ? 'error'
      : host && game
        ? game.result
          ? 'game-over'
          : 'playing'
        : 'connecting'
  return { phase: roomPhase, host, game, move, error }
}
