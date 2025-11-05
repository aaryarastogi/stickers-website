import React from 'react'
import { useCart } from '../context/CartContext'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

const Cart = () => {
  const { 
    cartItems, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart,
    getTotalPrice 
  } = useCart()

  // Calculate total price
  const totalPrice = getTotalPrice()

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
                    {/* Product Image Placeholder */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0" />

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
                        ₹ {((item.price || 900) * item.quantity).toFixed(2)}
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
                  ₹ {totalPrice.toFixed(2)}
                </span>
              </div>
              <button
                className="w-full py-3 bg-gray-100 border border-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-200 transition-colors shadow-md"
                onClick={() => {
                  // Handle payment logic here
                  console.log('Pay Now clicked')
                }}
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Cart

