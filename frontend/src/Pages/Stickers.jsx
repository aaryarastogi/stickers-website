import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AddIcon from '@mui/icons-material/Add'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'

const Stickers = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const templateTitle = location.state?.templateTitle || 'Stickers'
  const { addToCart, cartItems, openCart } = useCart()
  
  const [stickers, setStickers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likedCards, setLikedCards] = useState(new Set())

  useEffect(() => {
    fetchStickers()
  }, [templateTitle])

  const fetchStickers = async () => {
    try {
      setLoading(true)
      setError(null)
      // Encode template title to handle special characters
      const encodedTitle = encodeURIComponent(templateTitle)
      const response = await fetch(`/api/templates/${encodedTitle}/stickers`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stickers')
      }
      
      const data = await response.json()
      setStickers(data)
    } catch (err) {
      console.error('Error fetching stickers:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLike = (id) => {
    const newLikedCards = new Set(likedCards)
    if (newLikedCards.has(id)) {
      newLikedCards.delete(id)
    } else {
      newLikedCards.add(id)
    }
    setLikedCards(newLikedCards)
  }

  const handleAddToCart = (sticker) => {
    addToCart(sticker)
    openCart() // Open cart when item is added
  }

  const isInCart = (id) => {
    return cartItems.some(item => item.id === id)
  }

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl font-semibold text-textColor mb-10 text-center">
            {templateTitle}
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
              {stickers.map((sticker) => (
                <div key={sticker.id} className="flex flex-col">
                  {/* Sticker Card */}
                  <div className="relative bg-gray-200 rounded-2xl w-full h-72 flex items-center justify-center overflow-hidden shadow-md">
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
                    
                    {/* Icons Container - Top Right */}
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      {/* Heart Icon */}
                      <button
                        onClick={() => toggleLike(sticker.id)}
                        className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                        aria-label="Like sticker"
                      >
                        <FavoriteIcon
                          className={`${
                            likedCards.has(sticker.id) ? 'text-red-500' : 'text-gray-600'
                          }`}
                          fontSize="small"
                        />
                      </button>

                      {/* Shopping Cart Icon with Plus */}
                      <button
                        onClick={() => handleAddToCart(sticker)}
                        className="relative p-2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
                        aria-label="Add to cart"
                      >
                        <ShoppingCartIcon
                          className={`${
                            isInCart(sticker.id) ? 'text-buttonColorend' : 'text-gray-600'
                          }`}
                          fontSize="small"
                        />
                        <AddIcon
                          className="absolute -top-1 -right-1 text-white bg-buttonColorend rounded-full"
                          style={{ fontSize: '12px' }}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Name, Price and Finish Circles */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-800 text-base font-medium">{sticker.name}</span>
                      <span className="text-gray-600 text-sm font-semibold">${parseFloat(sticker.price).toFixed(2)}</span>
                    </div>
                    
                    {/* Finish Type Circles (Matte, Glossy, Metal) */}
                    {sticker.finishes && sticker.finishes.length > 0 && (
                      <div className="flex items-center relative">
                        {(() => {
                          const finishColors = {
                            matte: '#FFB347',    // Light orange/peach
                            glossy: '#20B2AA',   // Teal
                            metal: '#FFD700'      // Gold/yellow
                          }
                          
                          // Sort finishes in consistent order: matte, glossy, metal
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">
                No stickers found for this template
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Stickers

