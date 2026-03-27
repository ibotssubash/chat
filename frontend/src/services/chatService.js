import api from './authService'

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/conversations/')
    return response.data
  },

  getConversation: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}`)
    return response.data
  },

  createConversation: async (participantIds) => {
    const response = await api.post('/conversations/', { participant_ids: participantIds })
    return response.data
  },

  getMessages: async (conversationId, skip = 0, limit = 100) => {
    const response = await api.get(`/messages/conversation/${conversationId}?skip=${skip}&limit=${limit}`)
    return response.data
  },

  createMessage: async (conversationId, content) => {
    const response = await api.post('/messages/', { conversation_id: conversationId, content })
    return response.data
  },

  deleteMessage: async (messageId) => {
    const response = await api.delete(`/messages/${messageId}`)
    return response.data
  },

  getUsers: async () => {
    const response = await api.get('/auth/users')
    return response.data
  }
}

export class WebSocketService {
  constructor() {
    this.ws = null
    this.listeners = {}
  }

  connect(conversationId, token) {
    // Authentication check
    if (!token) {
      console.error('Cannot connect WebSocket - no authentication token')
      return
    }

    const wsUrl = `wss://chat-6-dbw5.onrender.com/ws/${conversationId}?token=${token}`
    console.log('Connecting to WebSocket:', wsUrl)
    
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('Connected to WebSocket for conversation:', conversationId)
    }

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('WebSocket message received:', message)
      this.emit('message', message)
    }

    this.ws.onclose = () => {
      console.log('Disconnected from WebSocket')
      this.emit('disconnect')
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('error', error)
    }
  }

  disconnect() {
    if (this.ws) {
      console.log('Disconnecting WebSocket...')
      this.ws.close()
      this.ws = null
    }
  }

  sendMessage(content) {
    if (!this.ws) {
      console.error('Cannot send message - WebSocket not connected')
      return
    }
    
    if (this.ws.readyState === WebSocket.OPEN) {
      const messageData = { content, timestamp: new Date().toISOString() }
      console.log('Sending WebSocket message:', messageData)
      this.ws.send(JSON.stringify(messageData))
    } else {
      console.error('Cannot send message - WebSocket not ready, state:', this.ws.readyState)
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }
}

export const wsService = new WebSocketService()
