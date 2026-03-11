import { useState } from 'react'
import Profile from './Profile'

const Sidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  user,
  onLogout,
  onCreateConversation,
  users,
  showCreateConversation,
  selectedUsers,
  onUserSelection,
  onCreateConversationSubmit,
  onCancelCreateConversation,
  onRefreshUsers // Add refresh function
}) => {
  // Debug user authentication
  console.log('Sidebar - Current user:', user)
  console.log('Sidebar - Users available for conversation:', users)
  const [showProfile, setShowProfile] = useState(false)
  const getUserProfileImage = (userId) => {
  // Try to get saved profile image from localStorage
  return localStorage.getItem(`profile_image_${userId}`)
}

const getConversationDisplay = (conversation) => {
    // Try to use participant_names from backend first
    if (conversation.participant_names && conversation.participant_names.length > 0) {
      const names = conversation.participant_names
      if (names.length === 1) {
        const profileImage = getUserProfileImage(names[0]) // Try to get user's profile image
        return {
          name: names[0],
          avatar: profileImage || names[0].charAt(0).toUpperCase(),
          avatarType: profileImage ? 'image' : 'text',
          type: 'individual'
        }
      } else if (names.length === 2) {
        const profileImage1 = getUserProfileImage(names[0])
        const profileImage2 = getUserProfileImage(names[1])
        return {
          name: `${names[0]} & ${names[1]}`,
          avatar: profileImage1 || profileImage2 ? 'mixed' : `${names[0].charAt(0).toUpperCase()}${names[1].charAt(0).toUpperCase()}`,
          avatarType: profileImage1 || profileImage2 ? 'image' : 'text',
          type: 'group'
        }
      } else if (names.length === 3) {
        const profileImage1 = getUserProfileImage(names[0])
        const profileImage2 = getUserProfileImage(names[1])
        const profileImage3 = getUserProfileImage(names[2])
        return {
          name: `${names[0]}, ${names[1]} & ${names[2]}`,
          avatar: profileImage1 || profileImage2 || profileImage3 ? 'mixed' : `${names[0].charAt(0).toUpperCase()}${names[1].charAt(0).toUpperCase()}+`,
          avatarType: profileImage1 || profileImage2 || profileImage3 ? 'image' : 'text',
          type: 'group'
        }
      } else {
        // For 4+ participants, show first 3 and count
        const firstNames = names.slice(0, 3)
        const hasProfileImages = firstNames.some(name => getUserProfileImage(name))
        return {
          name: `${firstNames.join(', ')} & ${names.length - 3} others`,
          avatar: hasProfileImages ? 'mixed' : `${firstNames.map(n => n.charAt(0).toUpperCase()).join('')}+`,
          avatarType: hasProfileImages ? 'image' : 'text',
          type: 'group'
        }
      }
    }
    
    // Enhanced fallback with better formatting
    if (conversation.participant_count === 1) {
      return {
        name: 'Self Chat',
        avatar: 'ME',
        avatarType: 'text',
        type: 'self'
      }
    } else if (conversation.participant_count === 2) {
      return {
        name: 'You & 1 other',
        avatar: 'Y+1',
        avatarType: 'text',
        type: 'group'
      }
    } else if (conversation.participant_count === 3) {
      return {
        name: 'You & 2 others',
        avatar: 'Y+2',
        avatarType: 'text',
        type: 'group'
      }
    } else if (conversation.participant_count === 4) {
      return {
        name: 'You & 3 others',
        avatar: 'Y+3',
        avatarType: 'text',
        type: 'group'
      }
    } else if (conversation.participant_count === 5) {
      return {
        name: 'You & 4 others',
        avatar: 'Y+4',
        avatarType: 'text',
        type: 'group'
      }
    } else {
      // For larger groups, show group chat with member count
      return {
        name: `Group Chat (${conversation.participant_count} members)`,
        avatar: `G${conversation.participant_count}`,
        avatarType: 'text',
        type: 'group'
      }
    }
  }

  return (
    <div className="sidebar">
      <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#4a9eff' }}>Chat App</h3>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
          {user ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* User Profile Picture */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#4a9eff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundImage: getUserProfileImage(user.id) ? `url(${getUserProfileImage(user.id)})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {!getUserProfileImage(user.id) && user.username?.charAt(0)?.toUpperCase()}
                  </div>
                  
                  <div>
                    Logged in as: <strong>{user.username}</strong>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      ID: {user.id} | Email: {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#4a9eff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#3a8eef'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#4a9eff'}
                >
                  Profile
                </button>
              </div>
              <button
                onClick={onLogout}
                className="btn"
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#ff4757',
                  fontSize: '12px'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#ff3838'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ff4757'}
              >
                Logout
              </button>
            </>
          ) : (
            <div>Please login to continue</div>
          )}
        </div>
      </div>

      {showCreateConversation ? (
        <div className="create-conversation-form" style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          backgroundColor: '#1a1a1a'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#4a9eff' }}>Create New Conversation</h4>
          
          {users.length > 0 ? (
            <div className="user-list" style={{
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '15px'
            }}>
              {users
                .filter(u => u.id !== user?.id)
                .map(u => (
                  <div key={u.id} className="user-item" style={{
                    padding: '8px',
                    borderBottom: '1px solid #444',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <input
                      type="checkbox"
                      className="user-checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => onUserSelection(u.id)}
                      style={{ marginRight: '8px' }}
                    />
                    <label style={{ 
                      marginLeft: '5px', 
                      cursor: 'pointer',
                      color: '#fff',
                      fontSize: '14px'
                    }}>
                      {u.username}
                    </label>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ color: '#888', marginBottom: '15px', textAlign: 'center' }}>
              <div>No other users available for conversation</div>
              <button
                onClick={onRefreshUsers && onRefreshUsers}
                style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#4a9eff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Refresh Users
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onCreateConversationSubmit}
              className="btn"
              disabled={selectedUsers.length === 0}
              style={{ 
                flex: 1,
                backgroundColor: selectedUsers.length > 0 ? '#4a9eff' : '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '14px',
                cursor: selectedUsers.length > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              Create
            </button>
            <button
              onClick={onCancelCreateConversation}
              style={{ 
                flex: 1, 
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : user ? (
        <button
          onClick={onCreateConversation}
          className="btn"
          style={{ 
            margin: '15px', 
            width: 'calc(100% - 30px)',
            backgroundColor: '#4a9eff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '12px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3a8eef'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4a9eff'}
        >
          + New Conversation
        </button>
      ) : (
        <div style={{ 
          margin: '15px', 
          padding: '12px',
          textAlign: 'center',
          color: '#888',
          fontSize: '14px'
        }}>
          Please login to create conversations
        </div>
      )}

      <div>
        {conversations.map(conversation => {
          const display = getConversationDisplay(conversation)
          return (
            <div
              key={conversation.id}
              className={`conversation-item ${
                selectedConversation?.id === conversation.id ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 15px',
                cursor: 'pointer',
                borderRadius: '8px',
                marginBottom: '5px',
                transition: 'background-color 0.2s',
                backgroundColor: selectedConversation?.id === conversation.id ? '#3a8eef' : 'transparent'
              }}
              onMouseOver={(e) => {
                if (selectedConversation?.id !== conversation.id) {
                  e.target.style.backgroundColor = '#2a2a2a'
                }
              }}
              onMouseOut={(e) => {
                if (selectedConversation?.id !== conversation.id) {
                  e.target.style.backgroundColor = 'transparent'
                }
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: display.type === 'individual' ? '50%' : '8px',
                backgroundColor: display.type === 'individual' ? '#4a9eff' : '#ff6b6b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: display.type === 'individual' ? '16px' : '12px',
                fontWeight: 'bold',
                color: 'white',
                flexShrink: 0,
                overflow: 'hidden',
                backgroundImage: display.avatarType === 'image' && display.type === 'individual' ? `url(${display.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative'
              }}>
                {/* Handle different avatar types */}
                {display.avatarType === 'image' && display.type === 'individual' ? (
                  // Single user with profile image - no text needed
                  null
                ) : display.avatarType === 'image' && display.type === 'group' ? (
                  // Group with some profile images - show mixed indicator
                  <span style={{ fontSize: '10px' }}>👥</span>
                ) : (
                  // Text-based avatar (initials)
                  display.avatar
                )}
              </div>
              
              {/* Conversation Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '500',
                  color: '#fff',
                  fontSize: '14px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {display.name}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#888', 
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {new Date(conversation.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Profile Modal */}
      {showProfile && (
        <Profile 
          user={user} 
          onLogout={onLogout} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </div>
  )
}

export default Sidebar
