import Peer, { type DataConnection } from 'peerjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { applyMove, newGame, type GameState, type Mark } from '../game/ticTacToe'
import { stateMsg } from './gameSync'
import { isGuestMsg, type HostMsg, type Profile } from './protocol'

export type HostPhase = 'connecting' | 'waiting' | 'playing' | 'game-over' | 'error'

export type HostRoom = {
  phase: HostPhase
  opponent: Profile | null
  game: GameState
  move(cell: number): void
  error: string | null
}

const HOST: Mark = 'X'
const GUEST: Mark = 'O'

/**
 * State is per room: the caller remounts (key) on a new room id.
 * The host's Peer id *is* the room id. Default PeerJS options: public
 * signaling server and default ICE config (no `config`, no TURN).
 *
 * Host-authoritative (#4): this hook keeps the only GameState. The host's own
 * clicks and the guest's `move` messages both go through `applyMove`; after
 * every accepted change the full `state` snapshot goes to the guest.
 */
export function useHostRoom(roomId: string, profile: Profile): HostRoom {
  const [phase, setPhase] = useState<'connecting' | 'waiting' | 'connected' | 'error'>('connecting')
  const [opponent, setOpponent] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [game, setGame] = useState<GameState>(() => newGame(HOST))

  const gameRef = useRef(game)
  const guestRef = useRef<DataConnection | null>(null)

  /** Validate and apply; on success store and broadcast. Rejected moves change nothing. */
  const apply = useCallback((player: Mark, cell: number) => {
    const r = applyMove(gameRef.current, player, cell)
    if (!r.ok) return
    gameRef.current = r.state
    setGame(r.state)
    guestRef.current?.send(stateMsg(r.state))
  }, [])

  useEffect(() => {
    const peer = new Peer(roomId)
    const send = (conn: DataConnection, msg: HostMsg) => conn.send(msg)

    peer.on('open', () => setPhase('waiting'))

    peer.on('connection', (conn) => {
      if (guestRef.current) {
        conn.close() // only the first connection is accepted
        return
      }
      guestRef.current = conn
      conn.on('data', (data) => {
        if (!isGuestMsg(data)) return
        if (data.type === 'hello') {
          setOpponent({ name: data.name, avatar: data.avatar })
          setPhase('connected')
          send(conn, { type: 'welcome', host: profile })
          send(conn, stateMsg(gameRef.current))
        } else if (data.type === 'move') {
          apply(GUEST, data.cell)
        }
      })
    })

    peer.on('error', (e) => {
      setError(e.type)
      setPhase('error')
    })

    return () => {
      guestRef.current = null
      peer.destroy()
    }
  }, [roomId, profile, apply])

  const move = useCallback((cell: number) => apply(HOST, cell), [apply])

  const roomPhase: HostPhase =
    phase === 'connected' ? (game.result ? 'game-over' : 'playing') : phase
  return { phase: roomPhase, opponent, game, move, error }
}
