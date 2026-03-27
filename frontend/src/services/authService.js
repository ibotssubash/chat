import axios from 'axios'

const API_BASE_URL = 'https://chat-6-dbw5.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('Adding token to request:', config.url)
  } else {
    console.log('No token available for request:', config.url)
  }
  return config
})

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    
    // Handle CORS errors specifically
    if (error.message && error.message.includes('CORS')) {
      console.error('CORS Error detected - backend may need to be restarted')
      // Try to provide more helpful error message
      error.message = 'CORS error: Backend connection blocked. Please ensure backend is running with correct CORS settings.'
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('Network Error - check if backend is running on port 8000')
      error.message = 'Network error: Cannot connect to backend. Please check if backend server is running on port 8000.'
    }
    
    // Handle 500 errors
    if (error.response?.status === 500) {
      console.error('Server Error - backend internal error')
      error.message = 'Server error: Backend encountered an internal error. Check backend logs for details.'
    }
    
    return Promise.reject(error)
  }
)

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/auth/users')
    return response.data
  }
}

export default api
