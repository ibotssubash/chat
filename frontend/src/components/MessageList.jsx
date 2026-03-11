import { useEffect, useRef, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const MessageList = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef(null)
  const { user } = useContext(AuthContext) // Get authenticated user

  const getUserProfileImage = (userId) => {
    // Try to get saved profile image from localStorage
    return localStorage.getItem(`profile_image_${userId}`)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Authentication check
  if (!user) {
    return (
      <div className="message-list" style={{ 
        textAlign: 'center', 
        color: '#888', 
        marginTop: '50px',
        padding: '20px'
      }}>
        <div style={{ 
          fontSize: '16px', 
          marginBottom: '10px',
          color: '#ff6b6b'
        }}>
          🔒 Authentication Required
        </div>
        <div style={{ fontSize: '14px' }}>
          Please login to view and send messages
        </div>
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          color: '#888', 
          marginTop: '50px' 
        }}>
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map(message => (
          <div
            key={message.id}
            className={`message ${
              message.sender_id === currentUserId ? 'own' : 'other'
            }`}
            style={{
              opacity: message.sender_id === currentUserId ? 1 : 0.9,
              marginBottom: '15px'
            }}
          >
            <div className="message-header">
              {/* Profile Picture */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#4a9eff',
                marginRight: '8px',
                display: 'inline-block',
                verticalAlign: 'middle',
                backgroundImage: getUserProfileImage(message.sender_id) ? `url(${getUserProfileImage(message.sender_id)})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                overflow: 'hidden'
              }}>
                {!getUserProfileImage(message.sender_id) && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'white',
                    display: 'block',
                    textAlign: 'center',
                    lineHeight: '24px'
                  }}>
                    {message.sender?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              
              <strong style={{ 
                color: message.sender_id === currentUserId ? '#4a9eff' : '#fff',
                verticalAlign: 'middle'
              }}>
                {message.sender?.username || 'Unknown User'}
              </strong>
              {message.sender_id !== currentUserId && (
                <span style={{ 
                  fontSize: '10px', 
                  color: '#666', 
                  marginLeft: '5px',
                  backgroundColor: '#333',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  verticalAlign: 'middle'
                }}>
                  ID: {message.sender_id}
                </span>
              )}
              <span className="timestamp">
                {formatTime(message.created_at)}
              </span>
            </div>
            <div className="message-content" style={{
              wordWrap: 'break-word',
              maxWidth: '100%'
            }}>
              {message.content}
            </div>
            {/* Message metadata for debugging */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{ 
                fontSize: '10px', 
                color: '#444', 
                marginTop: '5px',
                fontFamily: 'monospace'
              }}>
                Msg ID: {message.id} | Conv ID: {message.conversation_id}
              </div>
            )}
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList
