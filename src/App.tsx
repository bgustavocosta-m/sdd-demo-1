import { HashRouter } from 'react-router'
import { AppRoutes } from './AppRoutes'

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}
