// Utility function to test authentication
export const testAuthentication = async () => {
  console.log('=== Authentication Test ===')
  
  // Check if token exists
  const token = localStorage.getItem('token')
  console.log('Token in localStorage:', !!token)
  
  if (token) {
    console.log('Token value:', token.substring(0, 20) + '...')
  }
  
  // Test API endpoints
  try {
    const response = await fetch('http://localhost:8000/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const user = await response.json()
      console.log('✅ Authentication successful:', user)
      return { success: true, user }
    } else {
      console.log('❌ Authentication failed:', response.status)
      return { success: false, error: response.status }
    }
  } catch (error) {
    console.log('❌ Network error:', error)
    return { success: false, error: error.message }
  }
}

// Test API connectivity
export const testAPIConnectivity = async () => {
  console.log('=== API Connectivity Test ===')
  
  try {
    const response = await fetch('http://localhost:8000/health')
    if (response.ok) {
      console.log('✅ Backend is reachable')
      return true
    } else {
      console.log('❌ Backend not responding:', response.status)
      return false
    }
  } catch (error) {
    console.log('❌ Cannot reach backend:', error)
    return false
  }
}
