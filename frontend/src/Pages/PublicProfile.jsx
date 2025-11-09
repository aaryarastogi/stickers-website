import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar'
import { useCurrency } from '../context/CurrencyContext'

const PublicProfile = () => {
  const navigate = useNavigate()
  const { username } = useParams()
  const { formatPrice } = useCurrency()
  const [profile, setProfile] = useState(null)
  const [userStickers, setUserStickers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profile/public/${username}`)

      if (response.ok) {
        const data = await response.json()
        
        // Check if the current user is viewing their own profile
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            const currentUser = JSON.parse(userData)
            // If the current user's username matches the profile username, redirect to own profile
            if (currentUser.username === username || currentUser.username === data.username) {
              navigate('/profile', { replace: true })
              return
            }
          } catch (e) {
            console.error('Error parsing user data:', e)
          }
        }
        
        setProfile(data)
        
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
        // Only show published stickers in public profile
        const publishedStickers = data.filter(sticker => sticker.is_published)
        setUserStickers(publishedStickers)
      }
    } catch (err) {
      console.error('Error fetching stickers:', err)
    }
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
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <span className="text-white/90 text-lg">@{profile.username}</span>
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

        {/* Creations Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-textColor mb-6">Stickers</h2>
          {userStickers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userStickers.map((sticker) => (
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
                    {/* Published Badge */}
                    {sticker.is_published && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                        Published
                      </div>
                    )}
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
                        {/* Like Count Display */}
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
                    {sticker.specifications && typeof sticker.specifications === 'object' && (
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No published stickers yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicProfile

