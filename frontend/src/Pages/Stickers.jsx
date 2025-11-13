import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import LikeButton from '../Components/LikeButton'

const Stickers = () => {
  const location = useLocation()
  const navigate = useNavigate()
  // Get category data from navigation state or fallback to legacy format
  const categoryId = location.state?.categoryId
  const categoryName = location.state?.categoryName || location.state?.templateTitle || 'Stickers'
  const { addToCart, cartItems, updateQuantity } = useCart()
  const { formatPrice, formatPriceWithCurrency, formatStickerPrice } = useCurrency()
  
  const [stickers, setStickers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStickers()
  }, [categoryId, categoryName])

  const fetchStickers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Fetching stickers for category:', { categoryId, categoryName })
      
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      let allStickers = []
      
      // If we have categoryId, get stickers by category ID (more reliable)
      if (categoryId) {
        console.log(`📦 Fetching templates for category ID: ${categoryId}`)
        
        // First, get all templates for this category
        const templatesResponse = await fetch(`/api/templates?category=${categoryId}`, { headers })
        if (!templatesResponse.ok) {
          throw new Error('Failed to fetch templates for category')
        }
        const templates = await templatesResponse.json()
        console.log(`✅ Found ${templates.length} templates for category`)
        
        // Get stickers for each template
        for (const template of templates) {
          try {
            const stickersResponse = await fetch(`/api/templates/${template.id}/stickers`, { headers })
            if (stickersResponse.ok) {
              const templateStickers = await stickersResponse.json()
              allStickers = [...allStickers, ...templateStickers]
              console.log(`  ✅ Got ${templateStickers.length} stickers from template "${template.title}"`)
            }
          } catch (err) {
            console.warn(`  ⚠️ Failed to get stickers for template ${template.id}:`, err)
          }
        }
        
        // Also get user-created stickers for this category
        try {
          const encodedName = encodeURIComponent(categoryName)
          const userStickersResponse = await fetch(`/api/templates/${encodedName}/stickers`, { headers })
          if (userStickersResponse.ok) {
            const userStickers = await userStickersResponse.json()
            // Filter only user_created stickers
            const userCreatedOnly = userStickers.filter(s => s.sticker_type === 'user_created')
            allStickers = [...allStickers, ...userCreatedOnly]
            console.log(`  ✅ Got ${userCreatedOnly.length} user-created stickers`)
          }
        } catch (err) {
          console.warn('  ⚠️ Failed to get user-created stickers:', err)
        }
      } else {
        // Fallback: Use category name (legacy method)
        console.log(`📦 Fetching stickers by category name: ${categoryName}`)
        const encodedName = encodeURIComponent(categoryName)
        const response = await fetch(`/api/templates/${encodedName}/stickers`, { headers })
        
        if (!response.ok) {
          throw new Error('Failed to fetch stickers')
        }
        
        const data = await response.json()
        allStickers = Array.isArray(data) ? data : []
      }
      
      console.log(`✅ Total stickers fetched: ${allStickers.length}`)
      setStickers(allStickers)
    } catch (err) {
      console.error('❌ Error fetching stickers:', err)
      setError(err.message)
      setStickers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (sticker) => {
    const stickerType = sticker.sticker_type || 'template'
    const priceValue = sticker.price ? parseFloat(sticker.price) : 0
    addToCart({ 
      ...sticker, 
      sticker_type: stickerType, 
      price: priceValue,
      currency: sticker.currency || 'USD' // Preserve currency
    })
  }

  const isInCart = (id) => {
    return cartItems.some(item => item.id === id)
  }

  const getCartQuantity = (id) => {
    const item = cartItems.find(item => item.id === id)
    return item ? item.quantity : 0
  }

  const handleQuantityChange = (sticker, change) => {
    const currentQuantity = getCartQuantity(sticker.id)
    const newQuantity = currentQuantity + change
    updateQuantity(sticker.id, newQuantity)
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-semibold text-textColor mb-10 text-center">
            {categoryName}
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500 text-lg">Loading stickers...</div>
            </div>
          ) : stickers.length > 0 ? (
            /* Grid Layout - 2 rows, 3 columns */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {stickers.map((sticker) => {
                const stickerType = sticker.sticker_type || 'template'
                const priceValue = sticker.price ? parseFloat(sticker.price) : 0
                const finishes = Array.isArray(sticker.finishes) ? sticker.finishes : []
                const showFinishes = finishes.length > 0
                const isUserCreated = stickerType === 'user_created'
                const normalizedSticker = { ...sticker, sticker_type: stickerType, price: priceValue }

                return (
                  <div key={`${stickerType}-${sticker.id}`} className="flex flex-col">
                    {/* Sticker Card */}
                    <div 
                      className="relative bg-gray-200 rounded-2xl w-full h-72 flex items-center justify-center overflow-hidden shadow-md group cursor-pointer"
                      onClick={() => navigate(`/sticker/${stickerType}/${sticker.id}`)}
                    >
                      {/* Sticker Image */}
                      <img
                        src={sticker.image_url}
                        alt={sticker.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="text-gray-400 text-sm hidden">Sticker Preview</div>
                      {/* Badge for user-created stickers */}
                      {isUserCreated && (
                        <span className="absolute top-2 left-2 bg-purple-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          Community Pick
                        </span>
                      )}
                      {/* Like Button - Show on hover */}
                      <div 
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LikeButton
                          stickerId={sticker.id}
                          stickerType={stickerType}
                          initialLikeCount={sticker.like_count || 0}
                          initialIsLiked={sticker.is_liked || false}
                          size="small"
                        />
                      </div>
                    </div>

                    {/* Name, Price and Finish Circles */}
                    <div className="mt-3">
                      <div className="flex items-start justify-between">
                        {/* Left side: Name and Finish Circles */}
                        <div className="flex-1">
                          <span className="text-gray-800 text-base font-medium block mb-2">{sticker.name}</span>
                          {/* Finish Type Circles (Matte, Glossy, Metal) */}
                          {showFinishes && (
                            <div className="flex items-center relative">
                              {(() => {
                                const finishColors = {
                                  matte: '#FFB347',    // Light orange/peach
                                  glossy: '#20B2AA',   // Teal
                                  metal: '#FFD700'      // Gold/yellow
                                }
                                
                                // Sort finishes in consistent order: matte, glossy, metal
                                const finishOrder = ['matte', 'glossy', 'metal']
                                const sortedFinishes = [...finishes].sort((a, b) => {
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
                                          width: '24px',
                                          height: '24px',
                                          backgroundColor: finishColor,
                                        }}
                                      />
                                      {/* Tooltip on hover */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap capitalize z-50">
                                        {finish}
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    </div>
                                  )
                                })
                              })()}
                            </div>
                          )}
                        </div>

                        {/* Right side: Price and Add to Cart Button */}
                        <div className="flex flex-col items-end">
                          <span className="text-gray-600 text-sm font-semibold mb-2">{formatStickerPrice(priceValue, sticker.currency)}</span>
                          {/* Add to Cart Button / Quantity Selector */}
                          {isInCart(sticker.id) ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleQuantityChange(normalizedSticker, -1)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <RemoveIcon className="text-gray-700" fontSize="small" />
                              </button>
                              <span className="text-gray-800 font-semibold min-w-8 text-center">
                                {getCartQuantity(sticker.id)}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(normalizedSticker, 1)}
                                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                                aria-label="Increase quantity"
                              >
                                <AddIcon className="text-gray-700" fontSize="small" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(normalizedSticker)}
                              className="py-2 px-3 bg-gradient-to-r from-buttonColorst to-buttonColorend text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No stickers found for this category
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Stickers

