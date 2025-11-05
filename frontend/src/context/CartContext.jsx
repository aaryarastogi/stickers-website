import React, { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (sticker) => {
    const existingItem = cartItems.find(item => item.id === sticker.id)
    
    if (existingItem) {
      // If item exists, increase quantity
      setCartItems(cartItems.map(item =>
        item.id === sticker.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // Add new item with quantity 1
      setCartItems([...cartItems, { ...sticker, quantity: 1 }])
    }
  }

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setCartItems([])
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

