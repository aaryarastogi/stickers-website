import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import LikeButton from './LikeButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const PublishedStickers = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart, cartItems, updateQuantity } = useCart()
  const { formatPrice } = useCurrency()
  const [publishedStickers, setPublishedStickers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPublishedStickers()
  }, [location.pathname]) // Refresh when route changes (user navigates back to home)

  const fetchPublishedStickers = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch('/api/custom-stickers/published', {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        setPublishedStickers(data)
      } else {
        console.error('Failed to fetch published stickers')
      }
    } catch (error) {
      console.error('Error fetching published stickers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (sticker) => {
    const stickerItem = {
      id: `user-${sticker.id}`,
      name: sticker.name,
      category: sticker.category,
      price: parseFloat(sticker.price),
      quantity: 1,
      image_url: sticker.image_url,
      imagePreview: sticker.image_url,
      image: sticker.image_url,
      specifications: sticker.specifications || {},
      creator_name: sticker.creator_name,
      templateTitle: sticker.category
    }
    addToCart(stickerItem)
  }

  const isInCart = (stickerId) => {
    return cartItems.some(item => item.id === `user-${stickerId}`)
  }

  const getCartQuantity = (stickerId) => {
    const item = cartItems.find(item => item.id === `user-${stickerId}`)
    return item ? item.quantity : 0
  }

  const handleQuantityChange = (sticker, change) => {
    const itemId = `user-${sticker.id}`
    const currentQuantity = getCartQuantity(sticker.id)
    const newQuantity = currentQuantity + change
    updateQuantity(itemId, newQuantity)
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="text-center text-gray-500">Loading published stickers...</div>
      </div>
    )
  }

  if (publishedStickers.length === 0) {
    return null // Don't show section if no published stickers
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Community
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {publishedStickers.map((sticker) => (
          <div
            key={sticker.id}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Sticker Image */}
            <div 
              className="relative bg-gray-200 rounded-t-2xl w-full h-48 flex items-center justify-center overflow-hidden group cursor-pointer"
              onClick={() => navigate(`/sticker/user_created/${sticker.id}`)}
            >
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
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                Community
              </div>
              {/* Like Button - Show on hover */}
              <div 
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <LikeButton
                  stickerId={sticker.id}
                  stickerType="user_created"
                  initialLikeCount={sticker.like_count || 0}
                  initialIsLiked={sticker.is_liked || false}
                  size="small"
                />
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
              {sticker.creator_name && (
                <p className="text-xs text-purple-600 mb-2">by {sticker.creator_name}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-semibold">
                  {formatPrice(parseFloat(sticker.price || 0))}
                </span>
                {/* Add to Cart Button / Quantity Selector */}
                {isInCart(sticker.id) ? (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuantityChange(sticker, -1)
                      }}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <RemoveIcon className="text-gray-700" fontSize="small" />
                    </button>
                    <span className="text-gray-800 font-semibold min-w-8 text-center">
                      {getCartQuantity(sticker.id)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleQuantityChange(sticker, 1)
                      }}
                      className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <AddIcon className="text-gray-700" fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(sticker)
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PublishedStickers

