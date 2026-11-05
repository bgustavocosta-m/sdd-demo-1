import Peer, { type DataConnection } from 'peerjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { applyMove, newGame, rematch as nextGame, type GameState, type Mark } from '../game/ticTacToe'
import { stateMsg } from './gameSync'
import { startHeartbeat, type Heartbeat } from './heartbeat'
import { isGuestMsg, type HostMsg, type Profile } from './protocol'
import { newRoomId } from './roomId'

export type HostPhase =
  | 'connecting'
  | 'waiting'
  | 'playing'
  | 'game-over'
  | 'not-found'
  | 'opponent-left'

export type HostRoom = {
  roomId: string
  phase: HostPhase
  opponent: Profile | null
  game: GameState
  move(cell: number): void
  rematch(): void
}

const HOST: Mark = 'X'
const GUEST: Mark = 'O'

/**
 * The host's Peer id *is* the room id. Default PeerJS options: public
 * signaling server and default ICE config (no `config`, no TURN).
 *
 * Host-authoritative (#4): this hook keeps the only GameState. The host's own
 * clicks and the guest's `move` messages both go through `applyMove`; after
 * every accepted change the full `state` snapshot goes to the guest.
 *
 * `unavailable-id` is retryable (#2): a fresh id gets a new Peer, and once it
 * opens `onRoomIdChange(id)` lets the caller update the URL. That also covers
 * StrictMode's dev double mount reusing an id the server hasn't released yet.
 * The effect deliberately doesn't restart when the id changes, so the caller
 * must keep this hook mounted across the rename.
 */
export function useHostRoom(
  initialRoomId: string,
  profile: Profile,
  onRoomIdChange: (id: string) => void,
): HostRoom {
  const [firstId] = useState(initialRoomId)
  const [roomId, setRoomId] = useState(initialRoomId)
  const [phase, setPhase] = useState<
    'connecting' | 'waiting' | 'connected' | 'not-found' | 'opponent-left'
  >('connecting')
  const [opponent, setOpponent] = useState<Profile | null>(null)
  const [game, setGame] = useState<GameState>(() => newGame(HOST))

  const gameRef = useRef(game)
  const guestRef = useRef<DataConnection | null>(null)
  const onRoomIdChangeRef = useRef(onRoomIdChange)
  useEffect(() => {
    onRoomIdChangeRef.current = onRoomIdChange
  })

  /** Store the new state and broadcast it to the guest. */
  const commit = useCallback((state: GameState) => {
    gameRef.current = state
    setGame(state)
    guestRef.current?.send(stateMsg(state))
  }, [])

  /** Validate and apply; rejected moves change nothing. */
  const apply = useCallback(
    (player: Mark, cell: number) => {
      const r = applyMove(gameRef.current, player, cell)
      if (r.ok) commit(r.state)
    },
    [commit],
  )

  /** Either player may restart once the game is over; no accept step (#4). */
  const restart = useCallback(() => {
    if (gameRef.current.result === null) return
    commit(nextGame(gameRef.current))
  }, [commit])

  useEffect(() => {
    let peer: Peer
    let heartbeat: Heartbeat | null = null
    let over = false // a terminal phase was reached, or we unmounted

    const shutdown = () => {
      over = true
      heartbeat?.stop()
      guestRef.current = null
      peer.destroy()
    }
    const end = (reason: 'not-found' | 'opponent-left') => {
      if (over) return
      shutdown()
      setPhase(reason) // the room doesn't reopen
    }
    const send = (conn: DataConnection, msg: HostMsg) => conn.send(msg)

    const acceptGuest = (conn: DataConnection) => {
      guestRef.current = conn
      conn.on('open', () => {
        heartbeat = startHeartbeat(
          () => send(conn, { type: 'ping' }),
          () => end('opponent-left'),
        )
      })
      conn.on('data', (data) => {
        if (over) return
        heartbeat?.alive() // any message counts as alive
        if (!isGuestMsg(data)) return // malformed or unexpected: ignored
        if (data.type === 'hello') {
          setOpponent({ name: data.name, avatar: data.avatar })
          setPhase('connected')
          send(conn, { type: 'welcome', host: profile })
          send(conn, stateMsg(gameRef.current))
        } else if (data.type === 'move') {
          apply(GUEST, data.cell)
        } else if (data.type === 'rematch') {
          restart()
        }
      })
      conn.on('close', () => end('opponent-left'))
      conn.on('error', () => end('opponent-left'))
    }

    const turnAway = (conn: DataConnection) => {
      conn.on('open', () => {
        send(conn, { type: 'room-full' })
        conn.close({ flush: true })
      })
    }

    const open = (id: string) => {
      const p = new Peer(id)
      peer = p

      p.on('open', (openId) => {
        if (over || p !== peer) return
        setRoomId(openId)
        setPhase('waiting')
        if (openId !== firstId) onRoomIdChangeRef.current(openId)
      })

      p.on('connection', (conn) => {
        if (over || p !== peer) return conn.close()
        if (guestRef.current) turnAway(conn) // only the first connection is accepted
        else acceptGuest(conn)
      })

      p.on('error', (e) => {
        if (over || p !== peer) return
        if (e.type === 'unavailable-id' && !guestRef.current) {
          p.destroy()
          open(newRoomId())
          return
        }
        // Signaling errors before a guest joins end the room. Once a guest is
        // in, the data channel is peer-to-peer and the heartbeat decides.
        if (!guestRef.current) end('not-found')
      })
    }

    open(firstId)
    window.addEventListener('pagehide', shutdown)
    return () => {
      window.removeEventListener('pagehide', shutdown)
      shutdown()
    }
  }, [firstId, profile, apply, restart])

  const move = useCallback((cell: number) => apply(HOST, cell), [apply])

  const roomPhase: HostPhase =
    phase === 'connected' ? (game.result ? 'game-over' : 'playing') : phase
  return { roomId, phase: roomPhase, opponent, game, move, rematch: restart }
}
