import { useState, useRef, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('')
  const inputRef = useRef(null)
  const { user } = useContext(AuthContext) // Get authenticated user

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Authentication check
    if (!user) {
      console.error('User not authenticated - cannot send message')
      alert('Please login to send messages')
      return
    }
    
    if (message.trim()) {
      console.log('Sending message from user:', user.username, 'content:', message.trim())
      onSendMessage(message.trim())
      setMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Disable input if user is not authenticated
  const isDisabled = !user || !message.trim()

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={user ? "Type a message..." : "Please login to send messages..."}
            disabled={!user}
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #555',
              borderRadius: '4px',
              backgroundColor: user ? '#444' : '#333',
              color: user ? 'white' : '#888',
              fontSize: '14px',
              outline: 'none',
              cursor: user ? 'text' : 'not-allowed'
            }}
          />
          <button
            type="submit"
            className="btn"
            disabled={isDisabled}
            style={{ 
              width: '80px',
              padding: '12px',
              backgroundColor: isDisabled ? '#666' : '#4a9eff',
              cursor: isDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            Send
          </button>
        </div>
        {!user && (
          <div style={{ 
            fontSize: '12px', 
            color: '#ff6b6b', 
            marginTop: '5px',
            textAlign: 'center'
          }}>
            You must be logged in to send messages
          </div>
        )}
      </form>
    </div>
  )
}

export default MessageInput
