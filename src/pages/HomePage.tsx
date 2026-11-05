import { useNavigate } from 'react-router'
import { ProfileForm } from '../components/ProfileForm'
import type { Profile } from '../net/protocol'
import { newRoomId } from '../net/roomId'
import { useSession } from '../session'

export function HomePage() {
  const { createRoom } = useSession()
  const navigate = useNavigate()

  const create = (profile: Profile) => {
    const id = newRoomId()
    createRoom(id, profile)
    navigate(`/room/${id}`)
  }

  return (
    <main>
      <h1>Tic-tac-toe</h1>
      <ProfileForm submitLabel="Create room" onSubmit={create} />
    </main>
  )
}
