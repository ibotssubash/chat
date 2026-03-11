import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Frontend password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    if (new TextEncoder().encode(password).length > 72) {
      setError('Password cannot be longer than 72 characters for security reasons')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const result = await register(username, email, password)
    
    if (result.success) {
      navigate('/chat')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={72}
            required
          />
          <small style={{ 
            fontSize: '12px', 
            color: '#888',
            display: 'block',
            marginTop: '5px'
          }}>
            {password.length}/72 characters (minimum 6)
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={72}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center' }}>
          Already have an account? <Link to="/login" className="nav-link">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
