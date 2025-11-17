import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { getUserFromStorage, getTokenFromStorage } from '../utils/storageUtils'
import { 
  initializeRazorpay, 
  createPaymentOrder, 
  verifyPayment, 
  openRazorpayCheckout,
  convertToSmallestUnit 
} from '../utils/razorpayUtils'

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
  const { formatPrice, formatPriceWithCurrency, formatStickerPrice, currency, convertPrice } = useCurrency()
  
  const [user, setUser] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  // Initialize Razorpay on component mount
  useEffect(() => {
    initializeRazorpay()
  }, [])

  // Calculate total price - if all items are in same currency, sum directly
  // Otherwise, convert all to user's selected currency
  const calculateTotal = () => {
    if (cartItems.length === 0) return { total: 0, currency: currency.code }
    
    // Debug: Log all cart items
    console.log('Cart Items:', cartItems.map(item => ({
      name: item.name,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity
    })))
    
    // Check if all items have the same currency
    const firstCurrency = (cartItems[0].currency || 'USD').toUpperCase()
    const allSameCurrency = cartItems.every(item => 
      (item.currency || 'USD').toUpperCase() === firstCurrency
    )
    
    console.log('Currency Check:', {
      firstCurrency,
      allSameCurrency,
      userCurrency: currency.code
    })
    
    if (allSameCurrency) {
      // All items in same currency - just sum them
      let total = 0
      cartItems.forEach(item => {
        const itemPrice = parseFloat(item.price || 0)
        const itemQuantity = item.quantity || 1
        total += itemPrice * itemQuantity
        console.log(`Adding item: ${itemPrice} ${firstCurrency} x ${itemQuantity} = ${itemPrice * itemQuantity}`)
      })
      console.log('Total (same currency):', total, firstCurrency)
      return { total, currency: firstCurrency }
    } else {
      // Mixed currencies - convert all to user's selected currency
      const EXCHANGE_RATES = {
        USD: 1.0,
        INR: 83.0,
        GBP: 0.79,
        CAD: 1.35,
        AED: 3.67,
        EUR: 0.92,
        RUB: 92.0,
        AUD: 1.52
      }
      
      let total = 0
      const userCurrency = currency.code.toUpperCase()
      
      cartItems.forEach(item => {
        const itemPrice = parseFloat(item.price || 0)
        const itemCurrency = (item.currency || 'USD').toUpperCase()
        
        // Convert item price from its currency to USD first
        const itemPriceInUSD = itemPrice / (EXCHANGE_RATES[itemCurrency] || 1.0)
        // Then convert from USD to user's selected currency
        const itemPriceInUserCurrency = itemPriceInUSD * (EXCHANGE_RATES[userCurrency] || 1.0)
        
        total += itemPriceInUserCurrency * (item.quantity || 1)
      })
      return { total, currency: userCurrency }
    }
  }
  
  const { total: totalPrice, currency: totalCurrency } = calculateTotal()

  const handlePayment = async () => {
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

    const token = getTokenFromStorage()
    if (!token) {
      alert('Please login to proceed with payment')
      closeCart()
      navigate('/login')
      return
    }
    
    setIsProcessing(true)
    
    try {
      // Use the same calculation as display total
      // If all items are in same currency, use that currency for payment
      // Otherwise, convert to user's selected currency
      const EXCHANGE_RATES = {
        USD: 1.0,
        INR: 83.0,
        GBP: 0.79,
        CAD: 1.35,
        AED: 3.67,
        EUR: 0.92,
        RUB: 92.0,
        AUD: 1.52
      }
      
      // Check if all items have the same currency
      const firstCurrency = cartItems.length > 0 ? (cartItems[0].currency || 'USD').toUpperCase() : 'USD'
      const allSameCurrency = cartItems.every(item => 
        (item.currency || 'USD').toUpperCase() === firstCurrency
      )
      
      let totalInSelectedCurrency = 0
      let currencyCode = currency.code
      
      if (allSameCurrency) {
        // All items in same currency - sum directly and use that currency
        cartItems.forEach(item => {
          totalInSelectedCurrency += parseFloat(item.price || 0) * (item.quantity || 1)
        })
        currencyCode = firstCurrency
      } else {
        // Mixed currencies - convert all to user's selected currency
        const userCurrency = currency.code.toUpperCase()
        cartItems.forEach(item => {
          const itemPrice = parseFloat(item.price || 0)
          const itemCurrency = (item.currency || 'USD').toUpperCase()
          
          // Convert item price from its currency to USD first
          const itemPriceInUSD = itemPrice / (EXCHANGE_RATES[itemCurrency] || 1.0)
          // Then convert from USD to user's selected currency
          const itemPriceInUserCurrency = itemPriceInUSD * (EXCHANGE_RATES[userCurrency] || 1.0)
          
          totalInSelectedCurrency += itemPriceInUserCurrency * (item.quantity || 1)
        })
        currencyCode = userCurrency
      }
      
      // Force INR for Razorpay domestic payments (to avoid international card issues)
      // If user wants other currencies, they need international cards enabled in Razorpay
      if (currencyCode === 'INR') {
        currencyCode = 'INR'
      }
      
      // Debug logging
      console.log('Payment Details:', {
        currency: currencyCode,
        amount: totalInSelectedCurrency,
        allSameCurrency,
        itemsCurrency: firstCurrency
      })

      // Prepare order items - preserve original currency for display
      const orderItems = cartItems.map(item => ({
        id: item.id,
        name: item.name || 'Sticker',
        category: item.category || 'General',
        price: parseFloat(item.price || 0), // Keep original price
        currency: item.currency || 'USD', // Keep original currency
        quantity: item.quantity || 1,
        image_url: item.image_url || item.imagePreview || item.image,
        specifications: item.specifications || {}
      }))

      // Create payment order in backend
      const orderData = {
        user_id: user.id,
        amount: totalInSelectedCurrency,
        currency: currencyCode,
        order_type: 'CART_PURCHASE',
        items: orderItems
      }

      const orderResponse = await createPaymentOrder(orderData, token)
      
      // Open Razorpay checkout
      const paymentResponse = await openRazorpayCheckout(
        {
          amount: convertToSmallestUnit(totalInSelectedCurrency, currencyCode),
          currency: currencyCode,
          razorpay_order_id: orderResponse.razorpay_order_id
        },
        {
          name: 'Stickers Website',
          description: `Payment for ${cartItems.length} sticker(s)`,
          customerName: user.name || user.email,
          customerEmail: user.email
        }
      )

      // Verify payment
      const verificationData = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        user_id: user.id
      }

      const verificationResult = await verifyPayment(verificationData, token)

      if (!verificationResult.success) {
        throw new Error('Payment verification failed')
      }

      // Payment successful! Order is already saved in database via payment verification
      // No need to save to localStorage - orders are fetched from database
      
      const itemCount = cartItems.length
      
      // Clear cart after successful payment
      clearCart()
      
      // Close cart
      closeCart()
      
      // Show success message
      alert(`Payment successful! ${itemCount} sticker(s) added to your collection.`)
      
      // Redirect to home page
      navigate('/')
    } catch (error) {
      console.error('Error processing payment:', error)
      setIsProcessing(false)
      // Only show error if it's not a user cancellation
      if (error.message && !error.message.includes('cancelled by user') && !error.message.includes('Payment cancelled')) {
        alert(`Payment failed: ${error.message}`)
      }
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
                        {formatStickerPrice((item.price || 0) * item.quantity, item.currency)}
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
                  {formatStickerPrice(totalPrice, totalCurrency)}
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
                  user && !isProcessing
                    ? 'bg-gradient-to-r from-buttonColorst to-buttonColorend text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={handlePayment}
                disabled={!user || isProcessing}
                title={!user ? 'Please login to proceed with payment' : isProcessing ? 'Processing payment...' : 'Proceed to payment'}
              >
                {isProcessing ? 'Processing...' : user ? 'Pay Now' : 'Login to Pay'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart

