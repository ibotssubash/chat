import { createContext, useState, useEffect, useContext } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      console.log('Initializing auth, token exists:', !!token)
      if (token) {
        try {
          console.log('Fetching current user with token...')
          const userData = await authService.getCurrentUser()
          console.log('Current user data:', userData)
          setUser(userData)
        } catch (error) {
          console.error('Failed to get current user:', error)
          console.log('Removing invalid token from localStorage')
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [token])

  const login = async (username, password) => {
    try {
      console.log('Attempting login for user:', username)
      const response = await authService.login(username, password)
      console.log('Login response:', response)
      const { access_token } = response
      setToken(access_token)
      localStorage.setItem('token', access_token)
      console.log('Token saved to localStorage')
      
      const userData = await authService.getCurrentUser()
      console.log('User data after login:', userData)
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration for user:', username)
      await authService.register(username, email, password)
      console.log('Registration successful, attempting login...')
      const loginResult = await login(username, password)
      return loginResult
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    console.log('Logging out user:', user?.username)
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    console.log('Token removed from localStorage')
  }

  const value = {
    token,
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
