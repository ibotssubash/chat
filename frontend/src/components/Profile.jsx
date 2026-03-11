import { useState, useContext, useRef } from 'react'
import { AuthContext } from '../context/AuthContext'

const Profile = ({ user, onLogout, onClose }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const fileInputRef = useRef(null)
  const { logout } = useContext(AuthContext)

  const handleLogout = async () => {
    try {
      await logout()
      onLogout()
      onClose()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!profileImage) return
    
    setIsUploading(true)
    try {
      // For now, just store in localStorage
      // In production, you'd upload to your backend
      localStorage.setItem(`profile_image_${user.id}`, profileImage)
      console.log('Profile image updated')
      alert('Profile picture updated successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to update profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    localStorage.removeItem(`profile_image_${user.id}`)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    alert('Profile picture removed')
  }

  const getProfileImage = () => {
    // Try to get saved image from localStorage
    const savedImage = localStorage.getItem(`profile_image_${user.id}`)
    return savedImage || profileImage || null
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        border: '1px solid #444',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px'
        }}>
          <h2 style={{ 
            margin: 0, 
            color: '#4a9eff',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#444'
              e.target.style.color = '#fff'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#888'
            }}
          >
            ×
          </button>
        </div>

        {/* Profile Content */}
        <div style={{ marginBottom: '25px' }}>
          {/* Avatar */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#4a9eff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                overflow: 'hidden',
                backgroundImage: getProfileImage() ? `url(${getProfileImage()})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}>
                {!getProfileImage() && (user?.username?.charAt(0) || 'U')}
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: '#4a9eff',
                  border: '2px solid #2a2a2a',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#3a8eef'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4a9eff'}
                title="Change profile picture"
              >
                📷
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          {/* Preview Section */}
          {profileImage && (
            <div style={{
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#888',
                marginBottom: '10px'
              }}>
                New Profile Picture:
              </div>
              <img
                src={profileImage}
                alt="Profile preview"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #4a9eff'
                }}
              />
              <div style={{
                marginTop: '10px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleImageUpload}
                  disabled={isUploading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: isUploading ? '#666' : '#4a9eff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: isUploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUploading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleRemoveImage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* User Info */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#fff',
              fontSize: '20px',
              fontWeight: '500'
            }}>
              {user?.username}
            </h3>
            <p style={{ 
              margin: '0 0 5px 0', 
              color: '#888',
              fontSize: '14px'
            }}>
              {user?.email}
            </p>
            <p style={{ 
              margin: '0', 
              color: '#666',
              fontSize: '12px'
            }}>
              ID: {user?.id}
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              backgroundColor: '#333',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#4a9eff',
                marginBottom: '5px'
              }}>
                {user?.id || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                User ID
              </div>
            </div>
            <div style={{
              backgroundColor: '#333',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#4a9eff',
                marginBottom: '5px'
              }}>
                {user?.created_at ? formatDate(user.created_at).split(',')[0] : 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Joined
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div style={{
            backgroundColor: '#333',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
              Account Information
            </div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.5' }}>
              <div>• Member since: {user?.created_at ? formatDate(user.created_at) : 'Unknown'}</div>
              <div>• Status: <span style={{ color: '#4a9eff' }}>Active</span></div>
              <div>• Account Type: <span style={{ color: '#4a9eff' }}>Standard</span></div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#ff4757',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#ff3838'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#ff4757'}
          >
            Logout
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#555'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#666'}
          >
            Close
          </button>
        </div>

        {/* Logout Confirmation */}
        {showLogoutConfirm && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px'
          }}>
            <div style={{
              backgroundColor: '#333',
              padding: '25px',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: '#fff',
                fontSize: '18px'
              }}>
                Confirm Logout
              </h3>
              <p style={{ 
                margin: '0 0 20px 0', 
                color: '#888',
                fontSize: '14px'
              }}>
                Are you sure you want to logout?
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#ff4757',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Yes, Logout
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#666',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
