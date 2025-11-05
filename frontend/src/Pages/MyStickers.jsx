import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'

const MyStickers = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [purchasedStickers, setPurchasedStickers] = useState([])
  const [myCreatedStickers, setMyCreatedStickers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('purchased') // 'purchased' or 'created'

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        
        // Get purchased stickers for this user (use id or email as key)
        const allPurchases = JSON.parse(localStorage.getItem('purchasedStickers') || '{}')
        const userKey = parsedUser.id || parsedUser.email
        const userPurchases = allPurchases[userKey] || []
        setPurchasedStickers(userPurchases)

        // Fetch user's created stickers from database
        if (parsedUser.id) {
          fetchMyCreatedStickers(parsedUser.id)
        }
      } catch (e) {
        console.error('Error parsing user data:', e)
        setUser(null)
      }
    } else {
      // Redirect to login if not logged in
      navigate('/login', { state: { message: 'Please login to view your stickers', redirectTo: '/my-stickers' } })
    }
    setLoading(false)
  }, [navigate])

  const fetchMyCreatedStickers = async (userId) => {
    try {
      const response = await fetch(`/api/custom-stickers/my-stickers/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMyCreatedStickers(data)
      } else {
        console.error('Failed to fetch created stickers')
      }
    } catch (error) {
      console.error('Error fetching created stickers:', error)
    }
  }

  const handleTogglePublish = async (stickerId, currentStatus) => {
    if (!user) return

    try {
      const response = await fetch(`/api/custom-stickers/${stickerId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          is_published: !currentStatus
        })
      })

      if (response.ok) {
        // Refresh the list
        fetchMyCreatedStickers(user.id)
      } else {
        const error = await response.json()
        alert(`Failed to update: ${error.error}`)
      }
    } catch (error) {
      console.error('Error updating publish status:', error)
      alert('Failed to update publish status')
    }
  }

  const handleDeleteSticker = async (stickerId) => {
    if (!user) return

    // Confirm deletion
    const confirmed = window.confirm('Are you sure you want to delete this sticker? This action cannot be undone.')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/custom-stickers/${stickerId}?user_id=${user.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the list
        fetchMyCreatedStickers(user.id)
        alert('Sticker deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to delete: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting sticker:', error)
      alert('Failed to delete sticker')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            My Stickers
          </h1>
          <p className="text-gray-600 text-lg">
            View all your purchased and created stickers
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('purchased')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'purchased'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchased ({purchasedStickers.length})
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'created'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Created ({myCreatedStickers.length})
          </button>
        </div>

        {/* Purchased Stickers Tab */}
        {activeTab === 'purchased' && (
          <>
            {purchasedStickers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No Stickers Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't purchased any stickers yet. Start shopping to build your collection!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
            >
              Browse Stickers
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {purchasedStickers.length} {purchasedStickers.length === 1 ? 'sticker' : 'stickers'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchasedStickers.map((sticker, index) => (
                <div
                  key={sticker.id || index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Sticker Image */}
                  <div className="relative bg-gray-200 rounded-t-2xl w-full h-64 flex items-center justify-center overflow-hidden">
                    <img
                      src={sticker.image_url || sticker.imagePreview || sticker.image || 'https://via.placeholder.com/300'}
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
                  </div>

                  {/* Sticker Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                      {sticker.name || 'Custom Sticker'}
                    </h3>
                    {sticker.category && (
                      <p className="text-sm text-gray-500 mb-2">{sticker.category}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-semibold">
                        ${parseFloat(sticker.price || 0).toFixed(2)}
                      </span>
                      {sticker.purchaseDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(sticker.purchaseDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {sticker.specifications && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                          {sticker.specifications.size && (
                            <div>Size: {sticker.specifications.size}</div>
                          )}
                          {sticker.specifications.finish && (
                            <div>Finish: {sticker.specifications.finish}</div>
                          )}
                          {sticker.specifications.quantity && (
                            <div>Quantity: {sticker.specifications.quantity}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
          </>
        )}

        {/* Created Stickers Tab */}
        {activeTab === 'created' && (
          <>
            {myCreatedStickers.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-24 w-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No Created Stickers Yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Create your own custom stickers and share them with others!
                </p>
                <button
                  onClick={() => navigate('/custom-sticker-creator')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
                >
                  Create Sticker
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  Showing {myCreatedStickers.length} {myCreatedStickers.length === 1 ? 'sticker' : 'stickers'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {myCreatedStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* Sticker Image */}
                      <div className="relative bg-gray-200 rounded-t-2xl w-full h-64 flex items-center justify-center overflow-hidden">
                        <img
                          src={sticker.image_url || 'https://via.placeholder.com/300'}
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
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
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
                            ${parseFloat(sticker.price || 0).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(sticker.created_at).toLocaleDateString()}
                          </span>
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
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTogglePublish(sticker.id, sticker.is_published)}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                              sticker.is_published
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {sticker.is_published ? '✓ Published' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDeleteSticker(sticker.id)}
                            className="py-2 px-4 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold transition-colors"
                            title="Delete sticker"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyStickers

