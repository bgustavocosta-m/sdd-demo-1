import { Route, Routes } from 'react-router'
import { HomePage } from './pages/HomePage'
import { RoomPage } from './pages/RoomPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:id" element={<RoomPage />} />
    </Routes>
  )
}
