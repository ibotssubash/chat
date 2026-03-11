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
      
      <div className="main-chat">
        {selectedConversation ? (
          <>
            <MessageList messages={messages} currentUserId={user.id} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: '#888'
          }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
