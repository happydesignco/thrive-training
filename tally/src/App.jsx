import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { useFamily } from './context/FamilyContext.jsx'
import { isSupabaseConfigured } from './lib/supabase.js'

import Layout from './components/Layout.jsx'
import SignIn from './pages/SignIn.jsx'
import SignUp from './pages/SignUp.jsx'
import SetupFamily from './pages/SetupFamily.jsx'
import ParentHome from './pages/ParentHome.jsx'
import KidsManage from './pages/KidsManage.jsx'
import KidView from './pages/KidView.jsx'
import LogReading from './pages/LogReading.jsx'
import SpendScreenTime from './pages/SpendScreenTime.jsx'
import SendTokens from './pages/SendTokens.jsx'
import Approvals from './pages/Approvals.jsx'
import Rules from './pages/Rules.jsx'
import History from './pages/History.jsx'
import Board from './pages/Board.jsx'
import MissingConfig from './pages/MissingConfig.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function RequireFamily({ children }) {
  const { needsFamily, loading } = useFamily()
  if (loading) return <FullScreenSpinner />
  if (needsFamily) return <Navigate to="/setup-family" replace />
  return children
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="opacity-60">Loading…</div>
    </div>
  )
}

export default function App() {
  if (!isSupabaseConfigured) return <MissingConfig />

  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/setup-family" element={<RequireAuth><SetupFamily /></RequireAuth>} />

      <Route element={<RequireAuth><RequireFamily><Layout /></RequireFamily></RequireAuth>}>
        <Route path="/" element={<ParentHome />} />
        <Route path="/kids" element={<KidsManage />} />
        <Route path="/board" element={<Board />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/history" element={<History />} />
        <Route path="/kid/:id" element={<KidView />} />
        <Route path="/kid/:id/log-reading" element={<LogReading />} />
        <Route path="/kid/:id/spend" element={<SpendScreenTime />} />
        <Route path="/kid/:id/send" element={<SendTokens />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
