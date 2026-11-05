const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'
const LENGTH = 10

/** A room id is the host's PeerJS id: `ttt-` + 10 random `[a-z0-9]`. */
export function newRoomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(LENGTH))
  let suffix = ''
  // 252 = 7 * 36: reject the tail so every character is equally likely.
  for (let i = 0; suffix.length < LENGTH; i++) {
    if (i === bytes.length) {
      crypto.getRandomValues(bytes)
      i = 0
    }
    if (bytes[i] < 252) suffix += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return `ttt-${suffix}`
}

export function shareUrl(id: string): string {
  return `${location.origin}${import.meta.env.BASE_URL}#/room/${id}`
}
