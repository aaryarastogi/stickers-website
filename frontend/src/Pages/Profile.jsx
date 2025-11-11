import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useCurrency } from '../context/CurrencyContext'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../utils/imageUtils'
import { getUserFromStorage, updateUserFieldInStorage } from '../utils/storageUtils'

const Profile = () => {
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [profile, setProfile] = useState(null)
  const [myStickers, setMyStickers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditingImage, setIsEditingImage] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [copied, setCopied] = useState(false)
  const [imageUploadMethod, setImageUploadMethod] = useState('url') // 'url' or 'file'
  const [selectedFile, setSelectedFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showCrop, setShowCrop] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [imageToCrop, setImageToCrop] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchProfile()
    // Get current user from localStorage using utility
    const user = getUserFromStorage()
    if (user) {
      setUser(user)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const currentUser = getUserFromStorage()

      // Own profile (requires auth)
      if (!token || !currentUser) {
        navigate('/login', { state: { message: 'Please login to view your profile', redirectTo: '/profile' } })
        return
      }

      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setNewImageUrl(data.profileImageUrl || '')
        setNewUsername(data.username || '')
        
        // Fetch user's stickers
        if (data.id) {
          fetchUserStickers(data.id)
        }
      } else {
        console.error('Failed to fetch profile')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStickers = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`/api/custom-stickers/my-stickers/${userId}`, {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        const formatted = data.map((sticker) => {
          let specs = sticker.specifications
          if (typeof specs === 'string') {
            try {
              specs = JSON.parse(specs)
            } catch (err) {
              specs = null
            }
          }
          const status = (sticker.status || (sticker.is_published ? 'APPROVED' : 'PENDING')).toUpperCase()
          return {
            ...sticker,
            specifications: specs || {},
            status,
            admin_note: sticker.admin_note || sticker.adminNote || null,
          }
        })
        setMyStickers(formatted)
      }
    } catch (err) {
      console.error('Error fetching stickers:', err)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      setSelectedFile(file)
      
      // Create preview and show crop interface
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result
        setImageToCrop(imageUrl)
        setShowCrop(true)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
      }
      reader.readAsDataURL(file)
    }
  }

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels)
      setImagePreview(croppedImage)
      setNewImageUrl(croppedImage)
      setShowCrop(false)
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Failed to crop image')
    }
  }

  const handleCancelCrop = () => {
    setShowCrop(false)
    setImageToCrop(null)
    setSelectedFile(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }

  const handleUpdateImage = async () => {
    if (!newImageUrl || newImageUrl.trim() === '') {
      alert('Please provide an image URL or upload an image')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileImageUrl: newImageUrl
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setIsEditingImage(false)
        setImageUploadMethod('url')
        setSelectedFile(null)
        setImagePreview(null)
        setShowCrop(false)
        setImageToCrop(null)
        setCrop({ x: 0, y: 0 })
        setZoom(1)
        setCroppedAreaPixels(null)
        // Update local storage user data using utility
        updateUserFieldInStorage('profileImageUrl', data.profileImageUrl)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update image')
      }
    } catch (err) {
      console.error('Error updating image:', err)
      alert('Failed to update image')
    }
  }

  const handleUpdateUsername = async () => {
    if (!newUsername || newUsername.trim() === '') {
      alert('Username cannot be empty')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setIsEditingUsername(false)
        // Update local storage user data using utility
        updateUserFieldInStorage('username', data.username)
        // If on public profile, navigate to new username
        if (profile?.username) {
          navigate(`/profile/${data.username}`)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update username')
      }
    } catch (err) {
      console.error('Error updating username:', err)
      alert('Failed to update username')
    }
  }

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${profile?.username}`
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const getProfileImage = () => {
    if (profile?.profileImageUrl) {
      return profile.profileImageUrl
    }
    // Default avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=random&size=200`
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500 text-lg">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500 text-lg">Profile not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-buttonColorst to-buttonColorend rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={getProfileImage()}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
              {!isEditingImage && (
                <button
                  onClick={() => {
                    setIsEditingImage(true)
                    setNewImageUrl(profile?.profileImageUrl || '')
                    setImageUploadMethod('url')
                    setSelectedFile(null)
                    setImagePreview(null)
                  }}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                  title="Edit image"
                >
                  <EditIcon fontSize="small" className="text-gray-700" />
                </button>
              )}
              {isEditingImage && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => {
                      setIsEditingImage(false)
                      setNewImageUrl(profile?.profileImageUrl || '')
                      setImageUploadMethod('url')
                      setSelectedFile(null)
                      setImagePreview(null)
                    }}
                  />
                  {/* Modal */}
                  <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div 
                      className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Upload Method Tabs */}
                      <div className="flex gap-1 mb-4 border-b border-gray-200">
                        <button
                          onClick={() => {
                            setImageUploadMethod('url')
                            setSelectedFile(null)
                            setImagePreview(null)
                            setNewImageUrl(profile?.profileImageUrl || '')
                          }}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                            imageUploadMethod === 'url'
                              ? 'border-b-2 border-buttonColorend text-buttonColorend'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          From URL
                        </button>
                        <button
                          onClick={() => setImageUploadMethod('file')}
                          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                            imageUploadMethod === 'file'
                              ? 'border-b-2 border-buttonColorend text-buttonColorend'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          From Device
                        </button>
                      </div>

                      {/* URL Input Method */}
                      {imageUploadMethod === 'url' && !showCrop && (
                        <div>
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="Enter image URL"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-buttonColorend focus:border-transparent"
                          />
                          {newImageUrl && (
                            <div className="mb-4">
                              <div className="relative">
                                <img
                                  src={newImageUrl}
                                  alt="Preview"
                                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    setImageToCrop(newImageUrl)
                                    setShowCrop(true)
                                    setCrop({ x: 0, y: 0 })
                                    setZoom(1)
                                  }}
                                  className="absolute top-2 right-2 px-3 py-1.5 bg-buttonColorend text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                                  title="Crop image"
                                >
                                  Crop
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* File Upload Method */}
                      {imageUploadMethod === 'file' && !showCrop && (
                        <div>
                          <label htmlFor="image-upload" className="block mb-4 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              id="image-upload"
                            />
                            <div className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-buttonColorend transition-colors text-center bg-gray-50 hover:bg-gray-100">
                              {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-sm font-medium text-gray-700">{selectedFile.name}</span>
                                  <span className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                  <span className="text-xs text-gray-400 mt-1">Click to select a different image</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-2">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-600 font-medium">Click to select image</span>
                                  <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                                </div>
                              )}
                            </div>
                          </label>
                          {imagePreview && !showCrop && (
                            <div className="mb-4">
                              <div className="relative">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-40 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  onClick={() => {
                                    if (imageToCrop) {
                                      setShowCrop(true)
                                    } else if (selectedFile) {
                                      const reader = new FileReader()
                                      reader.onloadend = () => {
                                        setImageToCrop(reader.result)
                                        setShowCrop(true)
                                      }
                                      reader.readAsDataURL(selectedFile)
                                    }
                                  }}
                                  className="absolute top-2 right-2 px-3 py-1.5 bg-buttonColorend text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                                  title="Re-crop image"
                                >
                                  Re-crop
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Image Cropper */}
                      {showCrop && imageToCrop && (
                        <div className="mb-4">
                          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <Cropper
                              image={imageToCrop}
                              crop={crop}
                              zoom={zoom}
                              aspect={1}
                              onCropChange={setCrop}
                              onZoomChange={setZoom}
                              onCropComplete={onCropComplete}
                              cropShape="round"
                            />
                          </div>
                          {/* Zoom Control */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Zoom: {zoom.toFixed(2)}x
                            </label>
                            <input
                              type="range"
                              min={1}
                              max={3}
                              step={0.1}
                              value={zoom}
                              onChange={(e) => setZoom(parseFloat(e.target.value))}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          {/* Crop Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={handleCropImage}
                              className="flex-1 px-4 py-2 bg-buttonColorend text-white rounded-lg text-sm font-semibold hover:opacity-90"
                            >
                              Apply Crop
                            </button>
                            <button
                              onClick={handleCancelCrop}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Only show when not cropping */}
                      {!showCrop && (
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={handleUpdateImage}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-buttonColorst to-buttonColorend text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingImage(false)
                              setNewImageUrl(profile?.profileImageUrl || '')
                              setImageUploadMethod('url')
                              setSelectedFile(null)
                              setImagePreview(null)
                              setShowCrop(false)
                              setImageToCrop(null)
                              setCrop({ x: 0, y: 0 })
                              setZoom(1)
                              setCroppedAreaPixels(null)
                            }}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <button
                  onClick={handleShareProfile}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  title="Share profile"
                >
                  <ShareIcon className="text-white" fontSize="small" />
                </button>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                {isEditingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="px-3 py-1 border rounded-md text-lg"
                    />
                    <button
                      onClick={handleUpdateUsername}
                      className="px-3 py-1 bg-white text-buttonColorend rounded-md text-sm font-semibold hover:bg-gray-100"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingUsername(false)
                        setNewUsername(profile.username || '')
                      }}
                      className="px-3 py-1 bg-white/20 text-white rounded-md text-sm hover:bg-white/30"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-white/90 text-lg">@{profile.username}</span>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                      title="Edit username"
                    >
                      <EditIcon fontSize="small" className="text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Profile Link */}
              <div className="flex items-center justify-center md:justify-start gap-2 rounded-lg px-4 py-2">
                <span className="text-white text-sm">Profile Link:</span>
                <code className="text-white text-xs bg-white/20 px-2 py-1 rounded">
                  {window.location.origin}/profile/{profile.username}
                </code>
                <button
                  onClick={handleShareProfile}
                  className="p-1 hover:bg-white/30 rounded transition-colors"
                  title="Copy link"
                >
                  <ContentCopyIcon fontSize="small" className="text-white" />
                </button>
                {copied && (
                  <span className="text-white text-xs bg-green-500 px-2 py-1 rounded">Copied!</span>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center justify-center md:justify-start gap-6">
                <div className="text-white">
                  <span className="text-2xl font-bold">{profile.stickerCount || 0}</span>
                  <span className="text-white/80 text-sm ml-1">Creations</span>
                </div>
                <div className="text-white">
                  <span className="text-2xl font-bold">{profile.likesCount || 0}</span>
                  <span className="text-white/80 text-sm ml-1">Likes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Creations Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-textColor mb-6">My Creations</h2>
          {myStickers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myStickers.map((sticker) => {
                const normalizedStatus = (sticker.status || (sticker.is_published ? 'APPROVED' : 'PENDING')).toUpperCase()
                const isApproved = normalizedStatus === 'APPROVED'
                const isPending = normalizedStatus === 'PENDING'
                const isRejected = normalizedStatus === 'REJECTED'
                const statusLabel = isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending Review'
                const statusClasses = isApproved
                  ? 'bg-green-500 text-white'
                  : isRejected
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-400 text-gray-900'

                return (
                  <div
                    key={sticker.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Sticker Image */}
                    <div 
                      className="relative bg-gray-200 rounded-t-2xl w-full h-64 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/sticker/user_created/${sticker.id}`)}
                    >
                      <img
                        src={sticker.image_url || sticker.imageUrl || 'https://via.placeholder.com/300'}
                        alt={sticker.name || 'Sticker'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="text-gray-400 text-sm hidden items-center justify-center h-full">
                        Sticker Preview
                      </div>
                      <div className={`absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full z-10 ${statusClasses}`}>
                        {statusLabel}
                      </div>
                    </div>

                    {/* Sticker Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                        {sticker.name || 'Custom Sticker'}
                      </h3>
                      {sticker.category && (
                        <p className="text-sm text-gray-500 mb-2">{sticker.category}</p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600 font-semibold">
                          {formatPrice(parseFloat(sticker.price || 0))}
                        </span>
                        <div className="flex items-center gap-3">
                          {sticker.like_count > 0 && (
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                              </svg>
                              <span>{sticker.like_count}</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(sticker.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        {isPending && (
                          <p className="text-sm text-amber-600">
                            Awaiting admin review.
                          </p>
                        )}
                        {isRejected && sticker.admin_note && (
                          <p className="text-sm text-red-600">
                            Reason: {sticker.admin_note}
                          </p>
                        )}
                      </div>

                      {sticker.specifications && typeof sticker.specifications === 'object' && Object.keys(sticker.specifications).length > 0 && (
                        <div className="mb-3 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500 space-y-1">
                            {sticker.specifications.size && (
                              <div>Size: {sticker.specifications.size}</div>
                            )}
                            {sticker.specifications.finish && (
                              <div>Finish: {sticker.specifications.finish}</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (!user) return

                            const confirmed = window.confirm('Are you sure you want to delete this sticker? This action cannot be undone.')
                            if (!confirmed) return

                            try {
                              const token = localStorage.getItem('token')
                              const response = await fetch(`/api/custom-stickers/${sticker.id}?user_id=${user.id}`, {
                                method: 'DELETE',
                                headers: {
                                  'Authorization': `Bearer ${token}`
                                }
                              })

                              if (response.ok) {
                                fetchUserStickers(profile.id)
                                fetchProfile()
                              } else {
                                const error = await response.json()
                                alert(`Failed to delete: ${error.error}`)
                              }
                            } catch (error) {
                              console.error('Error deleting sticker:', error)
                              alert('Failed to delete sticker')
                            }
                          }}
                          className="flex-1 py-2 px-4 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition-colors"
                          title="Delete sticker"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No creations yet</p>
              <button
                onClick={() => navigate('/createstickers')}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-buttonColorst to-buttonColorend text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Your First Sticker
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile

