import { HEARTBEAT_MS, TIMEOUT_MS } from './peerConfig'

export type Heartbeat = {
  /** Call on every received message: any message counts as alive. */
  alive(): void
  stop(): void
}

/**
 * Calls `ping` every HEARTBEAT_MS, and `onDead` once after TIMEOUT_MS
 * without `alive()`. Start it once the connection is open (#2, #4).
 */
export function startHeartbeat(ping: () => void, onDead: () => void): Heartbeat {
  let silence: ReturnType<typeof setTimeout>
  const arm = () => {
    clearTimeout(silence)
    silence = setTimeout(() => {
      stop()
      onDead()
    }, TIMEOUT_MS)
  }
  const tick = setInterval(() => {
    try {
      ping()
    } catch {
      // A send on a closing channel throws; the silence timer decides.
    }
  }, HEARTBEAT_MS)
  const stop = () => {
    clearInterval(tick)
    clearTimeout(silence)
  }
  arm()
  return { alive: arm, stop }
}
