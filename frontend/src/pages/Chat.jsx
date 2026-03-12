import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import api from '../services/authService'
import MessageList from '../components/MessageList'
import MessageInput from '../components/MessageInput'
import Sidebar from '../components/Sidebar'
import { wsService } from '../services/chatService'

const Chat = () => {
  const { user, logout } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [showCreateConversation, setShowCreateConversation] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBackgroundImage, setShowBackgroundImage] = useState(false)
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [backgroundImage, setBackgroundImage] = useState('https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1920&q=80')

  const backgroundImages = [
    {
      id: 1,
      name: 'Nature Mountain',
      url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1920&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Ocean Sunset',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      name: 'Forest Path',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 4,
      name: 'City Lights',
      url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1920&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 5,
      name: 'Desert Dunes',
      url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=1920&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 6,
      name: 'Aurora Sky',
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1920&q=80',
      thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=100&q=80'
    }
  ]

  const handleImageSelect = (imageUrl) => {
    setBackgroundImage(imageUrl)
    setShowImageSelector(false)
  }

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      console.log('No user available, skipping data load')
      setLoading(false)
    }
  }, [user]) // Reload data when user changes

  useEffect(() => {
    if (selectedConversation) {
      loadMessages()
      connectWebSocket()
    }
    
    return () => {
      wsService.disconnect()
    }
  }, [selectedConversation])

  const loadData = async () => {
    try {
      console.log('Loading conversations and users...')
      console.log('Current user:', user)
      console.log('Token exists:', !!localStorage.getItem('token'))
      
      const [conversationsData, usersData] = await Promise.all([
        chatService.getConversations(),
        chatService.getUsers()
      ])
      
      console.log('Conversations loaded:', conversationsData.length, conversationsData)
      console.log('Users loaded:', usersData.length, usersData)
      
      setConversations(conversationsData || [])
      setUsers(usersData || [])
      
      // Check if we have users for conversation creation
      if (usersData && usersData.length > 0) {
        const otherUsers = usersData.filter(u => u.id !== user?.id)
        console.log('Available users for conversation:', otherUsers.length, otherUsers)
      } else {
        console.log('No users available for conversation')
      }
      
    } catch (error) {
      console.error('Failed to load data:', error)
      // Try to load users separately if conversations fail
      try {
        console.log('Attempting to load users separately...')
        const usersData = await chatService.getUsers()
        console.log('Users loaded separately:', usersData.length, usersData)
        setUsers(usersData || [])
      } catch (userError) {
        console.error('Failed to load users separately:', userError)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedConversation) return
    
    try {
      const messagesData = await chatService.getMessages(selectedConversation.id)
      setMessages(messagesData.reverse()) // Reverse to show oldest first
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const connectWebSocket = () => {
    if (!selectedConversation) return
    
    const token = localStorage.getItem('token')
    wsService.connect(selectedConversation.id, token)
    
    wsService.on('message', (newMessage) => {
      console.log('Received WebSocket message:', newMessage)
      
      // Transform broadcast message to match expected format
      const formattedMessage = {
        id: newMessage.id,
        conversation_id: newMessage.conversation_id,
        sender_id: newMessage.sender_id,
        content: newMessage.content,
        created_at: newMessage.created_at,
        sender: {
          username: newMessage.sender_username || 'Unknown User'
        }
      }
      
      // Check if message already exists to prevent duplicates
      setMessages(prev => {
        const messageExists = prev.some(msg => msg.id === formattedMessage.id)
        if (!messageExists) {
          console.log('Adding new message to list:', formattedMessage)
          return [...prev, formattedMessage]
        }
        console.log('Duplicate message detected, skipping:', formattedMessage.id)
        return prev
      })
    })
    
    wsService.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  const handleSendMessage = async (content) => {
    if (!content.trim() || !selectedConversation) return
    
    // Authentication check
    if (!user) {
      console.error('Cannot send message - user not authenticated')
      alert('Please login to send messages')
      return
    }
    
    console.log('Sending message:', {
      content: content.trim(),
      conversationId: selectedConversation.id,
      userId: user.id,
      username: user.username
    })
    
    try {
      // Only send via WebSocket for real-time delivery
      wsService.sendMessage(content.trim())
      
      console.log('Message sent successfully via WebSocket')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      console.log('No users selected for conversation')
      return
    }
    
    console.log('Creating conversation with users:', selectedUsers)
    console.log('Current user:', user)
    console.log('Token exists:', !!localStorage.getItem('token'))
    
    try {
      const participantIds = [...selectedUsers]
      console.log('Sending participant IDs:', participantIds)
      
      const response = await api.post('/conversations/', { participant_ids: participantIds })
      console.log('Conversation creation response:', response.data)
      
      const newConversation = response.data
      console.log('New conversation created:', newConversation)
      
      setConversations(prev => [newConversation, ...prev])
      setSelectedConversation(newConversation)
      setShowCreateConversation(false)
      setSelectedUsers([])
      
      // Show success message
      alert('Conversation created successfully!')
      
    } catch (error) {
      console.error('Failed to create conversation:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      let errorMessage = 'Failed to create conversation'
      
      if (error.response?.status === 500) {
        errorMessage = 'Server error: Backend encountered an issue. Please try again.'
      } else if (error.message && error.message.includes('CORS')) {
        errorMessage = 'CORS error: Please check if backend is running correctly'
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network error: Cannot connect to backend'
      } else if (error.response?.data?.detail) {
        errorMessage = `Error: ${error.response.data.detail}`
      }
      
      alert(errorMessage)
    }
  }

  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleRefreshUsers = async () => {
    console.log('Manually refreshing users...')
    try {
      const usersData = await chatService.getUsers()
      console.log('Users refreshed:', usersData.length, usersData)
      setUsers(usersData || [])
    } catch (error) {
      console.error('Failed to refresh users:', error)
    }
  }

  const handleMessageDeleted = (deletedMessageId) => {
    // Remove the deleted message from the state
    setMessages(prev => prev.filter(msg => msg.id !== deletedMessageId))
    console.log('Message deleted from UI:', deletedMessageId)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="chat-container">
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        user={user}
        onLogout={logout}
        onCreateConversation={() => {
          console.log('Create conversation button clicked')
          setShowCreateConversation(true)
        }}
        users={users}
        showCreateConversation={showCreateConversation}
        selectedUsers={selectedUsers}
        onUserSelection={handleUserSelection}
        onCreateConversationSubmit={handleCreateConversation}
        onCancelCreateConversation={() => {
          setShowCreateConversation(false)
          setSelectedUsers([])
        }}
        onRefreshUsers={handleRefreshUsers}
      />
      
      <div className="main-chat" style={{
        position: 'relative',
        backgroundImage: showBackgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: showBackgroundImage ? 'transparent' : '#1a1a1a'
      }}>
        {/* Background Toggle Button */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowImageSelector(!showImageSelector)}
            style={{
              padding: '8px 12px',
              backgroundColor: showBackgroundImage ? 'rgba(255, 255, 255, 0.2)' : '#4a9eff',
              color: '#fff',
              border: showBackgroundImage ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              backdropFilter: showBackgroundImage ? 'blur(10px)' : 'none',
              transition: 'all 0.3s ease'
            }}
            title="Change background image"
          >
            🎨 Change
          </button>
          <button
            onClick={() => setShowBackgroundImage(!showBackgroundImage)}
            style={{
              padding: '8px 12px',
              backgroundColor: showBackgroundImage ? 'rgba(255, 255, 255, 0.2)' : '#4a9eff',
              color: '#fff',
              border: showBackgroundImage ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              backdropFilter: showBackgroundImage ? 'blur(10px)' : 'none',
              transition: 'all 0.3s ease'
            }}
            title={showBackgroundImage ? 'Hide background image' : 'Show background image'}
          >
            {showBackgroundImage ? '🖼️ Hide' : '🖼️ Show'}
          </button>
        </div>

        {/* Image Selector Modal */}
        {showImageSelector && (
          <div style={{
            position: 'absolute',
            top: '50px',
            right: '10px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: '8px',
            padding: '15px',
            zIndex: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            minWidth: '300px'
          }}>
            <div style={{ marginBottom: '10px', color: '#fff', fontWeight: 'bold' }}>
              Choose Background Image:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {backgroundImages.map(img => (
                <div
                  key={img.id}
                  onClick={() => handleImageSelect(img.url)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: backgroundImage === img.url ? '2px solid #4a9eff' : '2px solid transparent',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  <img
                    src={img.thumbnail}
                    alt={img.name}
                    style={{
                      width: '100%',
                      height: '80px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    padding: '5px',
                    fontSize: '11px',
                    color: '#fff',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                  }}>
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowImageSelector(false)}
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                backgroundColor: '#ff4757',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        )}
        
        {selectedConversation ? (
          <>
            <MessageList 
              messages={messages} 
              currentUserId={user.id} 
              onMessageDeleted={handleMessageDeleted}
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: showBackgroundImage ? '#fff' : '#888',
            textShadow: showBackgroundImage ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
            backgroundColor: showBackgroundImage ? 'rgba(0,0,0,0.3)' : 'transparent',
            borderRadius: '8px',
            padding: '20px'
          }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
