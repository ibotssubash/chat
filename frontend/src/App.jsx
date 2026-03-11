import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext, AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'

function AppRoutes() {
  const { token, loading } = useContext(AuthContext)

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!token ? <Login /> : <Navigate to="/chat" />} 
      />
      <Route 
        path="/register" 
        element={!token ? <Register /> : <Navigate to="/chat" />} 
      />
      <Route 
        path="/chat" 
        element={token ? <Chat /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/" 
        element={<Navigate to={token ? "/chat" : "/login"} />} 
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App
