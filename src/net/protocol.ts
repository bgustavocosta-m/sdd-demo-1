/**
 * Messages exchanged over the PeerJS DataConnection (host-authoritative, #4).
 * Anything that fails these guards is ignored by the receiver.
 */

export type Profile = { name: string; avatar: string }

type Mark = 'X' | 'O'
type Cell = Mark | null
type Result = null | { winner: Mark } | 'draw'

export type GuestMsg =
  | { type: 'hello'; name: string; avatar: string }
  | { type: 'move'; cell: number }
  | { type: 'rematch' }
  | { type: 'ping' }

export type HostMsg =
  | { type: 'welcome'; host: Profile }
  | {
      type: 'state'
      board: Cell[]
      turn: Mark
      starter: Mark
      result: Result
      winLine: number[] | null
    }
  | { type: 'room-full' }
  | { type: 'ping' }

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj =>
  typeof v === 'object' && v !== null && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isMark = (v: unknown): v is Mark => v === 'X' || v === 'O'
const isCellIndex = (v: unknown): v is number => Number.isInteger(v)

export function isProfile(v: unknown): v is Profile {
  return isObj(v) && isStr(v.name) && isStr(v.avatar)
}

function isResult(v: unknown): v is Result {
  return v === null || v === 'draw' || (isObj(v) && isMark(v.winner))
}

function isBoard(v: unknown): v is Cell[] {
  return Array.isArray(v) && v.length === 9 && v.every((c) => c === null || isMark(c))
}

function isWinLine(v: unknown): v is number[] | null {
  return v === null || (Array.isArray(v) && v.length === 3 && v.every(isCellIndex))
}

export function isGuestMsg(v: unknown): v is GuestMsg {
  if (!isObj(v)) return false
  switch (v.type) {
    case 'hello':
      return isStr(v.name) && isStr(v.avatar)
    case 'move':
      return isCellIndex(v.cell)
    case 'rematch':
    case 'ping':
      return true
    default:
      return false
  }
}

export function isHostMsg(v: unknown): v is HostMsg {
  if (!isObj(v)) return false
  switch (v.type) {
    case 'welcome':
      return isProfile(v.host)
    case 'state':
      return (
        isBoard(v.board) &&
        isMark(v.turn) &&
        isMark(v.starter) &&
        isResult(v.result) &&
        isWinLine(v.winLine)
      )
    case 'room-full':
    case 'ping':
      return true
    default:
      return false
  }
}
