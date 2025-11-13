import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserFromStorage } from '../utils/storageUtils'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Storage key for cart items
const CART_STORAGE_KEY = 'cartItems'

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    if (cartData) {
      return JSON.parse(cartData)
    }
  } catch (error) {
    console.error('Error loading cart from storage:', error)
  }
  return []
}

// Save cart to localStorage
const saveCartToStorage = (cartItems) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  } catch (error) {
    console.error('Error saving cart to storage:', error)
    // If quota exceeded, try to clear old data
    if (error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded. Clearing old cart data...')
      try {
        localStorage.removeItem(CART_STORAGE_KEY)
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
      } catch (retryError) {
        console.error('Failed to save cart after clearing:', retryError)
      }
    }
  }
}

export const CartProvider = ({ children }) => {
  // Load cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => loadCartFromStorage())
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    saveCartToStorage(cartItems)
  }, [cartItems])

  // Listen for user login/logout to potentially sync cart
  useEffect(() => {
    const handleUserChange = () => {
      // When user logs in, cart is already loaded from localStorage
      // When user logs out, keep cart items (they persist)
      const user = getUserFromStorage()
      if (user) {
        // User logged in - cart items are already loaded from localStorage
        // Could sync with backend here in the future
      }
    }

    window.addEventListener('userLogin', handleUserChange)
    window.addEventListener('userLogout', handleUserChange)
    window.addEventListener('storage', handleUserChange)

    return () => {
      window.removeEventListener('userLogin', handleUserChange)
      window.removeEventListener('userLogout', handleUserChange)
      window.removeEventListener('storage', handleUserChange)
    }
  }, [])

  const addToCart = (sticker) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === sticker.id)
      
      if (existingItem) {
        // If item exists, increase quantity
        return prevItems.map(item =>
          item.id === sticker.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        // Add new item with quantity 1
        return [...prevItems, { ...sticker, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(prevItems => prevItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setCartItems([])
    // Also clear from localStorage
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing cart from storage:', error)
    }
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  const openCart = () => {
    setIsCartOpen(true)
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      toggleCart,
      openCart,
      closeCart,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

