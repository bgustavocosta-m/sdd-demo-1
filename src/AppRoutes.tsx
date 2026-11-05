import { Route, Routes } from 'react-router'
import { HomePage } from './pages/HomePage'
import { RoomPage } from './pages/RoomPage'
import { SessionProvider } from './session'

export function AppRoutes() {
  return (
    <SessionProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:id" element={<RoomPage />} />
      </Routes>
    </SessionProvider>
  )
}
