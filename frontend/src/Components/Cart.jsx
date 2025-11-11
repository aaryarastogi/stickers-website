import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { getUserFromStorage } from '../utils/storageUtils'

const Cart = () => {
  const navigate = useNavigate()
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart,
    clearCart,
    getTotalPrice 
  } = useCart()
  const { formatPrice } = useCurrency()
  
  const [user, setUser] = useState(null)

  // Check if user is logged in
  useEffect(() => {
    const checkUser = () => {
      const user = getUserFromStorage()
      setUser(user)
    }
    
    checkUser()
    
    // Listen for storage changes and custom events
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUser()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userLogin', checkUser)
    window.addEventListener('userLogout', checkUser)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userLogin', checkUser)
      window.removeEventListener('userLogout', checkUser)
    }
  }, [])

  // Calculate total price
  const totalPrice = getTotalPrice()

  const handlePayment = () => {
    if (!user) {
      // Close cart and redirect to login
      closeCart()
      navigate('/login', { 
        state: { 
          message: 'Please login to proceed with payment',
          redirectTo: '/'
        } 
      })
      return
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty')
      return
    }
    
    // User is logged in, proceed with payment
    console.log('Processing payment for user:', user)
    
    // Save number of items before clearing cart
    const itemCount = cartItems.length
    
    // Save purchased stickers to localStorage
    try {
      const allPurchases = JSON.parse(localStorage.getItem('purchasedStickers') || '{}')
      // Use user id or email as key
      const userKey = user.id || user.email
      const userPurchases = allPurchases[userKey] || []
      
      // Add current cart items to purchased stickers with purchase date
      const purchasedItems = cartItems.map(item => ({
        ...item,
        purchaseDate: new Date().toISOString()
      }))
      
      // Add new purchases to existing ones
      allPurchases[userKey] = [...userPurchases, ...purchasedItems]
      localStorage.setItem('purchasedStickers', JSON.stringify(allPurchases))
      
      // Clear cart after successful payment
      clearCart()
      
      // Close cart
      closeCart()
      
      // Show success message
      alert(`Payment successful! ${itemCount} sticker(s) added to your collection.`)
      
      // Redirect to My Stickers page
      navigate('/profile')
    } catch (error) {
      console.error('Error saving purchased stickers:', error)
      alert('Payment processed, but there was an error saving your stickers. Please contact support.')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[35%] bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ minWidth: '350px', maxWidth: '500px' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-textColor">My Cart</h1>
            <button
              onClick={closeCart}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ArrowBackIcon fontSize="small" />
              Continue shopping
            </button>
          </div>

          {/* Product List Headers */}
          {cartItems.length > 0 && (
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="col-span-5 text-sm font-medium text-gray-600">Product</div>
              <div className="col-span-4 text-sm font-medium text-gray-600 text-center">Qty.</div>
              <div className="col-span-3 text-sm font-medium text-gray-600 text-right">Price</div>
            </div>
          )}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Add some stickers to get started!</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg shrink-0 overflow-hidden bg-gray-200">
                      <img
                        src={item.image_url || item.imagePreview || item.image || item.imageSrc || 'https://via.placeholder.com/80'}
                        alt={item.name || `Sticker ${item.id}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.style.backgroundColor = '#E5E7EB'
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base mb-1">
                        {item.name || `Sticker ${item.id}`}
                      </h3>
                      <p className="text-sm text-gray-500">{item.category || 'Category'}</p>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <RemoveIcon fontSize="small" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <AddIcon fontSize="small" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-gray-800">
                        {formatPrice((item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Pay Button */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-800">Total:</span>
                <span className="text-lg font-bold text-gray-800">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              
              {/* Login Prompt */}
              {!user && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800 text-center">
                    Please <button 
                      onClick={() => {
                        closeCart()
                        navigate('/login')
                      }}
                      className="font-semibold text-yellow-900 hover:underline"
                    >login</button> to proceed with payment
                  </p>
                </div>
              )}
              
              <button
                className={`w-full py-3 font-semibold rounded-md transition-colors shadow-md ${
                  user
                    ? 'bg-gradient-to-r from-buttonColorst to-buttonColorend text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handlePayment}
                disabled={!user}
                title={!user ? 'Please login to proceed with payment' : 'Proceed to payment'}
              >
                {user ? 'Pay Now' : 'Login to Pay'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart

