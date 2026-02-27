import { UserProvider } from './hooks/useUser'
import Layout from './components/Layout'

export default function App() {
  return (
    <UserProvider>
      <Layout />
    </UserProvider>
  )
}
