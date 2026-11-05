import { useParams } from 'react-router'

export function RoomPage() {
  const { id } = useParams()
  return (
    <main>
      <h1>Room</h1>
      <p data-testid="room-id">{id}</p>
    </main>
  )
}
