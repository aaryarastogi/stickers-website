import React, { useState } from 'react'
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
  
  // Mock data for sticker variants - you can customize this based on the selected template
  const stickerVariants = [
    { id: 1, name: 'Variant 1', category: templateTitle, colors: ['#9D3DD9', '#3D9DD9', '#F4D956'], price: 900 },
    { id: 2, name: 'Variant 2', category: templateTitle, colors: ['#9D3DD9', '#3D9DD9', '#F4D956'], price: 900 },
    { id: 3, name: 'Variant 3', category: templateTitle, colors: ['#9D3DD9', '#3D9DD9', '#F4D956'], price: 900 },
    { id: 4, name: 'Variant 4', category: templateTitle, colors: ['#9D3DD9', '#3D9DD9', '#F4D956'], price: 900 },
    { id: 5, name: 'Variant 5', category: templateTitle, colors: ['#9D3DD9', '#3D9DD9', '#F4D956'], price: 900 },
    { id: 6, name: 'Variant 6', category: templateTitle, colors: ['#9D3DD9', '#3D9DD9', '#F4D956'], price: 900 },
  ]

  const [likedCards, setLikedCards] = useState(new Set())

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

        {/* Grid Layout - 2 rows, 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stickerVariants.map((sticker) => (
            <div key={sticker.id} className="flex flex-col">
              {/* Sticker Card */}
              <div className="relative bg-gray-200 rounded-2xl w-full h-72 flex items-center justify-center overflow-hidden shadow-md">
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

                {/* Placeholder for sticker image/content */}
                <div className="text-gray-400 text-sm">Sticker Preview</div>
              </div>

              {/* Name and Color Swatches */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-gray-800 text-base font-medium">Name</span>
                
                {/* Overlapping Color Circles */}
                <div className="flex items-center">
                  {sticker.colors.map((color, index) => (
                    <div
                      key={index}
                      className="rounded-full border-2 border-white shadow-sm"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color,
                        marginLeft: index > 0 ? '-8px' : '0',
                        zIndex: sticker.colors.length - index,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  )
}

export default Stickers

