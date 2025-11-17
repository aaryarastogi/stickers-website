import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserFromStorage, getTokenFromStorage } from '../utils/storageUtils'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Storage key for cart items (for non-logged-in users)
const CART_STORAGE_KEY = 'cartItems'

// Load cart from localStorage (for non-logged-in users)
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

// Save cart to localStorage (for non-logged-in users)
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

// Convert CartItem from backend to frontend format
const convertCartItemFromBackend = (item) => ({
  id: item.id?.toString() || item.sticker_id,
  stickerId: item.sticker_id,
  stickerType: item.sticker_type,
  name: item.name,
  category: item.category,
  price: parseFloat(item.price || 0),
  currency: item.currency || 'USD',
  quantity: item.quantity || 1,
  image_url: item.image_url,
  imagePreview: item.image_url,
  image: item.image_url,
  specifications: typeof item.specifications === 'string' 
    ? JSON.parse(item.specifications || '{}') 
    : (item.specifications || {})
})

// Convert frontend cart item to backend format
const convertCartItemToBackend = (item) => ({
  sticker_id: item.stickerId || item.id,
  sticker_type: item.stickerType || (String(item.id || '').startsWith('user-') ? 'user' : 'template'),
  name: item.name,
  category: item.category || 'uncategorized',
  price: item.price,
  currency: item.currency || 'USD',
  quantity: item.quantity || 1,
  image_url: item.image_url || item.imagePreview || item.image,
  specifications: typeof item.specifications === 'object' 
    ? JSON.stringify(item.specifications || {}) 
    : (item.specifications || '{}')
})

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Fetch cart from backend
  const fetchCartFromBackend = async () => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    
    if (!user || !token) {
      // Not logged in - load from localStorage
      const localCart = loadCartFromStorage()
      setCartItems(localCart)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const backendItems = await response.json()
        const convertedItems = backendItems.map(convertCartItemFromBackend)
        setCartItems(convertedItems)
        // Also save to localStorage as backup
        saveCartToStorage(convertedItems)
      } else {
        console.error('Failed to fetch cart from backend')
        // Fallback to localStorage
        const localCart = loadCartFromStorage()
        setCartItems(localCart)
      }
    } catch (error) {
      console.error('Error fetching cart from backend:', error)
      // Fallback to localStorage
      const localCart = loadCartFromStorage()
      setCartItems(localCart)
    } finally {
      setIsLoading(false)
    }
  }

  // Sync cart item to backend
  const syncCartItemToBackend = async (item, operation = 'add', backendId = null) => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    
    if (!user || !token) {
      // Not logged in - just save to localStorage
      saveCartToStorage(cartItems)
      return
    }

    try {
      setIsSyncing(true)
      const backendItem = convertCartItemToBackend(item)
      
      if (operation === 'add') {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendItem)
        })
      } else if (operation === 'update') {
        // Use provided backendId or fall back to item.id
        const idToUse = backendId || item.id
        const response = await fetch(`/api/cart/${idToUse}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: item.quantity })
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.error('Failed to update cart item:', error)
        }
      }
    } catch (error) {
      console.error('Error syncing cart item to backend:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Sync localStorage cart to backend when user logs in
  const syncLocalCartToBackend = async () => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    const localCart = loadCartFromStorage()
    
    if (!user || !token || localCart.length === 0) {
      return
    }

    try {
      // Add each localStorage item to backend
      for (const item of localCart) {
        const backendItem = convertCartItemToBackend(item)
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendItem)
        })
      }
      // Clear localStorage after syncing
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (error) {
      console.error('Error syncing local cart to backend:', error)
    }
  }

  // Load cart on mount and when user changes
  useEffect(() => {
    fetchCartFromBackend()
    
    const handleUserLogin = async () => {
      // First sync any localStorage items to backend
      await syncLocalCartToBackend()
      // Then fetch from backend
      await fetchCartFromBackend()
    }
    
    const handleUserLogout = () => {
      // On logout, clear cart from UI
      // Cart items remain in database for when user logs back in
      setCartItems([])
      // Clear localStorage cart as well since user is logged out
      localStorage.removeItem(CART_STORAGE_KEY)
    }

    const handleStorageChange = () => {
      const user = getUserFromStorage()
      if (user) {
        fetchCartFromBackend()
      } else {
        const localCart = loadCartFromStorage()
        setCartItems(localCart)
      }
    }

    window.addEventListener('userLogin', handleUserLogin)
    window.addEventListener('userLogout', handleUserLogout)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('userLogin', handleUserLogin)
      window.removeEventListener('userLogout', handleUserLogout)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Save to localStorage whenever cartItems change (for non-logged-in users only)
  // For logged-in users, cart is stored in database, so we don't need to save to localStorage
  useEffect(() => {
    const user = getUserFromStorage()
    if (!user) {
      // Only save to localStorage if user is not logged in
      saveCartToStorage(cartItems)
    } else {
      // If user is logged in, don't save to localStorage
      // Cart is persisted in database
    }
  }, [cartItems])

  const addToCart = async (sticker) => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    
    // If logged in, add directly to backend and refresh cart
    if (user && token) {
      try {
        const backendItem = convertCartItemToBackend({
          ...sticker,
          quantity: 1,
          stickerId: sticker.stickerId || sticker.id,
          stickerType: sticker.stickerType || (String(sticker.id || '').startsWith('user-') ? 'user' : 'template')
        })
        
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(backendItem)
        })
        
        if (response.ok) {
          // Refresh cart from backend to get the latest state
          await fetchCartFromBackend()
        } else {
          // If backend fails, update local state as fallback
          setCartItems(prevItems => {
            const existingItem = prevItems.find(item => 
              item.id === sticker.id || 
              (item.stickerId && item.stickerId === (sticker.stickerId || sticker.id))
            )
            
            if (existingItem) {
              return prevItems.map(item =>
                (item.id === sticker.id || (item.stickerId && item.stickerId === (sticker.stickerId || sticker.id)))
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            } else {
              const newItem = {
                ...sticker,
                quantity: 1,
                stickerId: sticker.stickerId || sticker.id,
                stickerType: sticker.stickerType || (String(sticker.id || '').startsWith('user-') ? 'user' : 'template')
              }
              return [...prevItems, newItem]
            }
          })
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        // Fallback to local state update
        setCartItems(prevItems => {
          const existingItem = prevItems.find(item => 
            item.id === sticker.id || 
            (item.stickerId && item.stickerId === (sticker.stickerId || sticker.id))
          )
          
          if (existingItem) {
            return prevItems.map(item =>
              (item.id === sticker.id || (item.stickerId && item.stickerId === (sticker.stickerId || sticker.id)))
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          } else {
            const newItem = {
              ...sticker,
              quantity: 1,
              stickerId: sticker.stickerId || sticker.id,
              stickerType: sticker.stickerType || (String(sticker.id || '').startsWith('user-') ? 'user' : 'template')
            }
            return [...prevItems, newItem]
          }
        })
      }
    } else {
      // Not logged in - update local state only
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => 
          item.id === sticker.id || 
          (item.stickerId && item.stickerId === (sticker.stickerId || sticker.id))
        )
        
        if (existingItem) {
          return prevItems.map(item =>
            (item.id === sticker.id || (item.stickerId && item.stickerId === (sticker.stickerId || sticker.id)))
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          const newItem = {
            ...sticker,
            quantity: 1,
            stickerId: sticker.stickerId || sticker.id,
            stickerType: sticker.stickerType || (String(sticker.id || '').startsWith('user-') ? 'user' : 'template')
          }
          return [...prevItems, newItem]
        }
      })
    }
  }

  const removeFromCart = async (id) => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    
    // Normalize ID to string for comparison
    const normalizedId = String(id)
    
    // Remove from backend if logged in
    if (user && token) {
      try {
        const response = await fetch(`/api/cart/${normalizedId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          // Refresh cart from backend to get the latest state
          await fetchCartFromBackend()
          return
        }
      } catch (error) {
        console.error('Error removing item from backend:', error)
      }
    }
    
    // Remove from state (compare both as strings) - fallback for non-logged-in users or if backend fails
    setCartItems(prevItems => prevItems.filter(item => String(item.id) !== normalizedId))
  }

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(id)
      return
    }
    
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    
    // Normalize ID to string for comparison
    const normalizedId = String(id)
    
    // If logged in, update backend first, then refresh cart
    if (user && token) {
      try {
        // Find the item to get its backend ID
        const currentItem = cartItems.find(item => String(item.id) === normalizedId)
        if (!currentItem) {
          console.error('Item not found in cart')
          return
        }
        
        const response = await fetch(`/api/cart/${currentItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        })
        
        if (response.ok) {
          // Refresh cart from backend to get the latest state
          await fetchCartFromBackend()
          return
        } else {
          console.error('Failed to update quantity in backend')
        }
      } catch (error) {
        console.error('Error updating quantity in backend:', error)
      }
    }
    
    // Fallback: Update local state (for non-logged-in users or if backend fails)
    setCartItems(prevItems => {
      return prevItems.map(item => {
        const itemId = String(item.id)
        return itemId === normalizedId ? { ...item, quantity } : item
      })
    })
  }

  const clearCart = async () => {
    const user = getUserFromStorage()
    const token = getTokenFromStorage()
    
    // Clear from backend if logged in
    if (user && token) {
      try {
        const response = await fetch('/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          // Refresh cart from backend (should be empty now)
          await fetchCartFromBackend()
          return
        }
      } catch (error) {
        console.error('Error clearing cart from backend:', error)
      }
    }
    
    // Fallback: Clear local state (for non-logged-in users or if backend fails)
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
      getTotalPrice,
      isLoading,
      isSyncing,
      refreshCart: fetchCartFromBackend
    }}>
      {children}
    </CartContext.Provider>
  )
}

