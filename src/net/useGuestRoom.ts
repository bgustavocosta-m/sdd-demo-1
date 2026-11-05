import Peer, { type DataConnection } from 'peerjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameState } from '../game/ticTacToe'
import { gameFromState } from './gameSync'
import { startHeartbeat, type Heartbeat } from './heartbeat'
import { CONNECT_TIMEOUT_MS } from './peerConfig'
import { isHostMsg, type GuestMsg, type Profile } from './protocol'

type Ending = 'not-found' | 'room-full' | 'opponent-left'

export type GuestPhase = 'idle' | 'connecting' | 'playing' | 'game-over' | Ending

export type GuestRoom = {
  phase: GuestPhase
  host: Profile | null
  game: GameState | null
  move(cell: number): void
}

/** Connects to the host whose Peer id is `roomId`. Idle until `profile` is set.
 * State is per room: the caller remounts (key) on a new room id.
 * The guest renders only from the host's `state` snapshots (#4); `move` just
 * sends an intent that the host validates. */
export function useGuestRoom(roomId: string, profile: Profile | null): GuestRoom {
  const [ending, setEnding] = useState<Ending | null>(null)
  const [host, setHost] = useState<Profile | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const connRef = useRef<DataConnection | null>(null)

  useEffect(() => {
    if (!profile) return

    const peer = new Peer()
    let heartbeat: Heartbeat | null = null
    let welcomed = false
    let over = false // a terminal phase was reached, or we unmounted

    const shutdown = () => {
      over = true
      clearTimeout(connectTimeout)
      heartbeat?.stop()
      connRef.current = null
      peer.destroy()
    }
    const end = (reason: Ending) => {
      if (over) return
      shutdown()
      setEnding(reason)
    }
    // Before `welcome` every failure means there's no room to join (#5).
    const lost = () => end(welcomed ? 'opponent-left' : 'not-found')

    const connectTimeout = setTimeout(() => {
      if (!welcomed) end('not-found')
    }, CONNECT_TIMEOUT_MS)

    peer.on('open', () => {
      if (over) return
      const conn = peer.connect(roomId, { reliable: true })
      const send = (msg: GuestMsg) => conn.send(msg)

      conn.on('open', () => {
        if (over) return
        connRef.current = conn
        send({ type: 'hello', name: profile.name, avatar: profile.avatar })
        heartbeat = startHeartbeat(() => send({ type: 'ping' }), lost)
      })
      conn.on('data', (data) => {
        if (over) return
        heartbeat?.alive() // any message counts as alive
        if (!isHostMsg(data)) return // malformed or unexpected: ignored
        if (data.type === 'room-full') {
          end('room-full')
        } else if (data.type === 'welcome' && !welcomed) {
          welcomed = true
          clearTimeout(connectTimeout)
          setHost(data.host)
        } else if (data.type === 'state') {
          setGame(gameFromState(data))
        }
      })
      conn.on('close', lost)
      conn.on('error', lost)
    })

    // `peer-unavailable`, signaling and WebRTC errors all mean "not found"
    // before we're in. After that the data channel is peer-to-peer, so
    // signaling hiccups don't matter and the heartbeat decides.
    peer.on('error', () => {
      if (!welcomed) end('not-found')
    })

    window.addEventListener('pagehide', shutdown)
    return () => {
      window.removeEventListener('pagehide', shutdown)
      shutdown()
    }
  }, [roomId, profile])

  const move = useCallback((cell: number) => {
    const msg: GuestMsg = { type: 'move', cell }
    connRef.current?.send(msg)
  }, [])

  const roomPhase: GuestPhase = !profile
    ? 'idle'
    : ending
      ? ending
      : host && game
        ? game.result
          ? 'game-over'
          : 'playing'
        : 'connecting'
  return { phase: roomPhase, host, game, move }
}
