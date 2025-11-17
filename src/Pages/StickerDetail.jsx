import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import LikeButton from '../Components/LikeButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import PersonIcon from '@mui/icons-material/Person'

const StickerDetail = () => {
  const navigate = useNavigate()
  const { stickerId, type } = useParams()
  const { addToCart, cartItems, updateQuantity } = useCart()
  const { formatPrice, formatPriceWithCurrency, formatStickerPrice } = useCurrency()
  const [sticker, setSticker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (stickerId && type) {
      fetchStickerDetail()
    }
  }, [stickerId, type])

  const fetchStickerDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch(`/api/stickers/${stickerId}?type=${type}`, {
        headers
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch sticker details')
      }
      
      const data = await response.json()
      setSticker(data)
    } catch (err) {
      console.error('Error fetching sticker details:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!sticker) return
    
    const stickerItem = {
      id: sticker.sticker_type === 'template' ? sticker.id : `user-${sticker.id}`,
      name: sticker.name,
      category: sticker.category || sticker.template_title,
      price: parseFloat(sticker.price),
      currency: sticker.currency || 'USD', // Preserve currency
      quantity: 1,
      image_url: sticker.image_url,
      imagePreview: sticker.image_url,
      image: sticker.image_url,
      specifications: sticker.specifications || {},
      templateTitle: sticker.template_title
    }
    addToCart(stickerItem)
  }

  const isInCart = () => {
    if (!sticker) return false
    const expectedStickerId = sticker.sticker_type === 'template' 
      ? String(sticker.id) 
      : `user-${sticker.id}`
    const directStickerId = String(sticker.id)
    
    // Check if any cart item matches this sticker
    return cartItems.some(item => {
      const itemStickerId = String(item.stickerId || '')
      const itemId = String(item.id || '')
      
      // Match by stickerId (preferred) or by id if it matches expected format
      return itemStickerId === expectedStickerId || 
             itemStickerId === directStickerId ||
             (itemId === expectedStickerId && !itemStickerId) // Fallback for old format
    })
  }

  const getCartQuantity = () => {
    if (!sticker) return 0
    const expectedStickerId = sticker.sticker_type === 'template' 
      ? String(sticker.id) 
      : `user-${sticker.id}`
    const directStickerId = String(sticker.id)
    
    // Find the cart item that matches this sticker
    const item = cartItems.find(item => {
      const itemStickerId = String(item.stickerId || '')
      const itemId = String(item.id || '')
      
      return itemStickerId === expectedStickerId || 
             itemStickerId === directStickerId ||
             (itemId === expectedStickerId && !itemStickerId) // Fallback for old format
    })
    return item ? item.quantity : 0
  }

  const handleQuantityChange = (change) => {
    if (!sticker) return
    const expectedStickerId = sticker.sticker_type === 'template' 
      ? String(sticker.id) 
      : `user-${sticker.id}`
    const directStickerId = String(sticker.id)
    
    // Find the actual cart item to get its backend ID
    const cartItem = cartItems.find(item => {
      const itemStickerId = String(item.stickerId || '')
      const itemId = String(item.id || '')
      
      return itemStickerId === expectedStickerId || 
             itemStickerId === directStickerId ||
             (itemId === expectedStickerId && !itemStickerId) // Fallback for old format
    })
    
    if (cartItem) {
      const currentQuantity = cartItem.quantity
      const newQuantity = currentQuantity + change
      // Use the cart item's ID (which is the backend cart_item.id)
      updateQuantity(cartItem.id, newQuantity)
    }
  }

  const handleCreatorClick = () => {
    if (sticker && sticker.creator_username) {
      navigate(`/profile/${sticker.creator_username}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500 text-lg">Loading sticker details...</div>
        </div>
      </div>
    )
  }

  if (error || !sticker) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="text-red-500 text-lg">{error || 'Sticker not found'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700 font-medium mb-6 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Sticker Image */}
            <div className="relative">
              <div className="relative bg-gray-200 rounded-2xl w-full aspect-square flex items-center justify-center overflow-hidden shadow-lg group">
                <img
                  src={sticker.image_url}
                  alt={sticker.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="text-gray-400 text-sm hidden items-center justify-center h-full">
                  Sticker Preview
                </div>
                {/* Like Button */}
                <div className="absolute bottom-4 right-4">
                  <LikeButton
                    stickerId={sticker.id}
                    stickerType={sticker.sticker_type}
                    initialLikeCount={sticker.like_count || 0}
                    initialIsLiked={sticker.is_liked || false}
                    size="large"
                  />
                </div>
              </div>
            </div>

            {/* Sticker Details */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{sticker.name}</h1>
                
                {/* Designed By */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-gray-600 font-medium">Designed by</span>
                  {sticker.sticker_type === 'user_created' && sticker.creator_username ? (
                    <button
                      onClick={handleCreatorClick}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                    >
                      <PersonIcon fontSize="small" />
                      <span>{sticker.designed_by}</span>
                      <span className="text-gray-500 text-sm">(@{sticker.creator_username})</span>
                    </button>
                  ) : (
                    <span className="text-purple-600 font-semibold">{sticker.designed_by}</span>
                  )}
                </div>

                {/* Price */}
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  {formatStickerPrice(parseFloat(sticker.price || 0), sticker.currency)}
                </div>

                {/* Template/Category Info */}
                {sticker.template_title && (
                  <div className="mb-4">
                    <span className="text-gray-600">Category: </span>
                    <span className="text-gray-900 font-medium">{sticker.template_title}</span>
                  </div>
                )}

                {/* Finish Type Circles (for template stickers) */}
                {sticker.finishes && sticker.finishes.length > 0 && (
                  <div className="mb-6">
                    <div className="text-gray-600 font-medium mb-2">Available Finishes:</div>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const finishColors = {
                          matte: '#FFB347',
                          glossy: '#20B2AA',
                          metal: '#FFD700'
                        }
                        
                        const finishOrder = ['matte', 'glossy', 'metal']
                        const sortedFinishes = [...sticker.finishes].sort((a, b) => {
                          const aIndex = finishOrder.indexOf(a.toLowerCase())
                          const bIndex = finishOrder.indexOf(b.toLowerCase())
                          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
                        })
                        
                        return sortedFinishes.map((finish, index) => {
                          const finishColor = finishColors[finish.toLowerCase()] || '#CCCCCC'
                          return (
                            <div
                              key={index}
                              className="relative group"
                              style={{
                                marginLeft: index > 0 ? '-8px' : '0',
                                zIndex: sortedFinishes.length - index,
                              }}
                            >
                              <div
                                className="rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  backgroundColor: finishColor,
                                }}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap capitalize z-50">
                                {finish}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                )}

                {/* Colors (for template stickers) */}
                {sticker.colors && sticker.colors.length > 0 && (
                  <div className="mb-6">
                    <div className="text-gray-600 font-medium mb-2">Available Colors:</div>
                    <div className="flex flex-wrap gap-2">
                      {sticker.colors.map((color, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-gray-100"
                        >
                          {color}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specifications (for user-created stickers) */}
                {sticker.specifications && typeof sticker.specifications === 'object' && (
                  <div className="mb-6">
                    <div className="text-gray-600 font-medium mb-2">Specifications:</div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {sticker.specifications.size && (
                        <div className="mb-2">
                          <span className="text-gray-600">Size: </span>
                          <span className="text-gray-900">{sticker.specifications.size}</span>
                        </div>
                      )}
                      {sticker.specifications.finish && (
                        <div>
                          <span className="text-gray-600">Finish: </span>
                          <span className="text-gray-900">{sticker.specifications.finish}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Add to Cart / Quantity Selector */}
                <div className="mt-8">
                  {isInCart() ? (
                    <div className="flex items-center justify-start gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <RemoveIcon className="text-gray-700" />
                        </button>
                        <span className="text-gray-800 font-semibold text-xl min-w-8 text-center">
                          {getCartQuantity()}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <AddIcon className="text-gray-700" />
                        </button>
                      </div>
                      <span className="text-gray-600">In cart</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="px-8 py-4 bg-gradient-to-r from-buttonColorst to-buttonColorend text-white text-lg font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StickerDetail

