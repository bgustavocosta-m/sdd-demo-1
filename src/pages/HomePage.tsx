import { useNavigate } from 'react-router'
import { HotSeatGame } from '../components/HotSeatGame'
import { NameForm } from '../components/NameForm'
import { newRoomId } from '../net/roomId'
import { useSession } from '../session'

export function HomePage() {
  const { createRoom } = useSession()
  const navigate = useNavigate()

  const create = (name: string) => {
    const id = newRoomId()
    createRoom(id, { name, avatar: '' })
    navigate(`/room/${id}`)
  }

  return (
    <main>
      <h1>Tic-tac-toe</h1>
      <NameForm submitLabel="Create room" onSubmit={create} />
      <HotSeatGame />
    </main>
  )
}
