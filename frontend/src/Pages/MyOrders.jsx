import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useCurrency } from '../context/CurrencyContext'
import { getUserFromStorage } from '../utils/storageUtils'

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  GBP: '£',
  EUR: '€',
  CAD: 'C$',
  AED: 'د.إ',
  RUB: '₽',
  AUD: 'A$'
}

// Format price with currency symbol (amount is already in the correct currency)
const formatPriceWithCurrency = (amount, currencyCode = 'INR') => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode
  return `${symbol}${parseFloat(amount || 0).toFixed(2)}`
}

const MyOrders = () => {
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'recent', 'oldest'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const parsedUser = getUserFromStorage()
    const token = localStorage.getItem('token')
    
    if (parsedUser && token) {
      setUser(parsedUser)
      fetchOrdersFromAPI(parsedUser.id, token)
    } else {
      // Redirect to login if not logged in
      navigate('/login', { state: { message: 'Please login to view your orders', redirectTo: '/my-orders' } })
      setLoading(false)
    }
  }, [navigate, filter])

  const fetchOrdersFromAPI = async (userId, token) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/payments/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const ordersData = await response.json()
      
      // Transform API orders to match the expected format
      const ordersList = ordersData.map(order => {
        // Parse order_data to get items
        let orderItems = []
        try {
          if (order.order_data) {
            orderItems = typeof order.order_data === 'string' 
              ? JSON.parse(order.order_data) 
              : order.order_data
          }
        } catch (e) {
          console.error('Error parsing order data:', e)
        }

        // For each item in the order, create an order entry
        if (orderItems.length > 0) {
          return orderItems.map((item, index) => ({
            id: `${order.id}-${index}`,
            orderId: order.id,
            sticker: {
              id: item.id,
              name: item.name || 'Sticker',
              category: item.category || 'General',
              image_url: item.image_url,
              imagePreview: item.image_url,
              image: item.image_url,
              price: parseFloat(item.price || 0),
              quantity: item.quantity || 1,
              specifications: item.specifications || {}
            },
            orderDate: order.created_at || new Date().toISOString(),
            price: parseFloat(item.price || 0) * (item.quantity || 1),
            quantity: item.quantity || 1,
            status: order.status === 'PAID' ? 'completed' : order.status?.toLowerCase() || 'pending',
            orderNumber: order.order_number,
            currency: order.currency || 'INR'
          }))
        } else {
          // Fallback if no items
          return [{
            id: order.id,
            orderId: order.id,
            sticker: {
              name: 'Order Items',
              category: order.order_type || 'General',
              price: parseFloat(order.amount || 0)
            },
            orderDate: order.created_at || new Date().toISOString(),
            price: parseFloat(order.amount || 0),
            quantity: 1,
            status: order.status === 'PAID' ? 'completed' : order.status?.toLowerCase() || 'pending',
            orderNumber: order.order_number,
            currency: order.currency || 'INR'
          }]
        }
      }).flat() // Flatten the array
      
      // Sort orders
      let sortedOrders = [...ordersList]
      if (filter === 'recent') {
        sortedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      } else if (filter === 'oldest') {
        sortedOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate))
      } else {
        // Default: most recent first
        sortedOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
      }
      
      setOrders(sortedOrders)
      setFilteredOrders(sortedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      // Fallback to localStorage if API fails
      const allPurchases = JSON.parse(localStorage.getItem('purchasedStickers') || '{}')
      const userKey = userId || user?.email
      const userPurchases = allPurchases[userKey] || []
      
      const ordersList = userPurchases.map((purchase, index) => {
        const orderDate = purchase.purchaseDate || new Date().toISOString()
        return {
          id: purchase.id || `order-${index}`,
          sticker: purchase,
          orderDate: orderDate,
          price: parseFloat(purchase.price || 0),
          quantity: purchase.quantity || 1,
          status: 'completed',
          orderNumber: purchase.orderNumber || `ORD-${index}`
        }
      })
      
      setOrders(ordersList)
      setFilteredOrders(ordersList)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const filtered = orders.filter(order => {
      const stickerName = (order.sticker.name || '').toLowerCase()
      const orderNumber = order.orderNumber.toLowerCase()
      const category = (order.sticker.category || '').toLowerCase()
      
      return stickerName.includes(query) || 
             orderNumber.includes(query) || 
             category.includes(query)
    })
    
    setFilteredOrders(filtered)
  }, [searchQuery, orders])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }


  const getTotalSpent = () => {
    // Sum all orders - amounts are already in their respective currencies
    // Note: This assumes all orders are in the same currency (which should be the case)
    return orders.reduce((total, order) => total + (order.price * order.quantity), 0)
  }

  const handleOrderClick = (order) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  const handleDownload = async (order) => {
    try {
      const imageUrl = order.sticker.image_url || 
                     order.sticker.imagePreview || 
                     order.sticker.image
      
      if (!imageUrl) {
        alert('Image not available for download')
        return
      }

      const stickerName = (order.sticker.name || 'sticker')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
      const fileName = `${stickerName}-${order.orderNumber}.png`

      if (imageUrl.startsWith('data:image')) {
        try {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Error downloading base64 image:', error)
          try {
            const link = document.createElement('a')
            link.href = imageUrl
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          } catch (fallbackError) {
            alert('Failed to download image. Please try right-clicking on the image and selecting "Save image as".')
          }
        }
      } else {
        try {
          const response = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit'
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch image')
          }
          
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (error) {
          console.error('Error downloading image:', error)
          const newWindow = window.open(imageUrl, '_blank')
          if (!newWindow) {
            alert('Please allow pop-ups to download the image.')
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error during download:', error)
      alert('An error occurred while downloading the image.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 text-base md:text-lg">
                View all your purchased stickers and order history
              </p>
            </div>
            {orders.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Total Orders</div>
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{orders.length}</div>
                <div className="text-sm text-gray-500 mb-1">Total Spent</div>
                <div className="text-xl md:text-2xl font-bold text-gray-900">
                  {orders.length > 0 && orders[0].currency 
                    ? formatPriceWithCurrency(getTotalSpent(), orders[0].currency)
                    : formatPrice(getTotalSpent())}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar and Filter Buttons */}
        {orders.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 lg:max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders by name, order number, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-12 pr-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-gray-600">
                    Found {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
                  </p>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => setFilter('recent')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    filter === 'recent'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setFilter('oldest')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    filter === 'oldest'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  Oldest First
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 && orders.length > 0 && searchQuery ? (
          <div className="text-center py-16 md:py-24 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="text-gray-400 mb-6">
              <svg
                className="mx-auto h-24 w-24 md:h-32 md:w-32"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              No Orders Found
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-base md:text-lg">
              No orders match your search query. Try different keywords.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Clear Search
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 md:py-24 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="text-gray-400 mb-6">
              <svg
                className="mx-auto h-24 w-24 md:h-32 md:w-32"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
              No Orders Yet
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-base md:text-lg">
              You haven't made any purchases yet. Start shopping to see your orders here!
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Browse Stickers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order)}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                {/* Sticker Image */}
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={order.sticker.image_url || order.sticker.imagePreview || order.sticker.image || 'https://via.placeholder.com/300'}
                    alt={order.sticker.name || 'Sticker'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex'
                      }
                    }}
                  />
                  <div className="hidden absolute inset-0 text-gray-400 text-sm items-center justify-center bg-gray-100">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                {/* Order Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                      <div className="space-x-5">
                      <span className="text-md font-semibold capitalize">{order.sticker.name}</span>
                      <span className="text-gray-500">{formatPriceWithCurrency(order.price * order.quantity, order.currency)}</span>
                      </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Delivered
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(order.orderDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <>
            {/* Backdrop with blur */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={closeModal}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between z-10">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Order Details</h2>
                    <p className="text-white/80 text-sm">Order #{selectedOrder.orderNumber}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Order Status and Date */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Order Date</div>
                      <div className="text-base font-semibold text-gray-900">{formatDate(selectedOrder.orderDate)}</div>
                      {selectedOrder.orderNumber && (
                        <div className="text-xs text-gray-400 mt-1">Order #: {selectedOrder.orderNumber}</div>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                      selectedOrder.status === 'completed' || selectedOrder.status === 'PAID' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedOrder.status === 'pending' || selectedOrder.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        selectedOrder.status === 'completed' || selectedOrder.status === 'PAID'
                          ? 'bg-green-500'
                          : selectedOrder.status === 'pending' || selectedOrder.status === 'PENDING'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}></span>
                      {selectedOrder.status === 'completed' || selectedOrder.status === 'PAID' 
                        ? 'Paid' 
                        : selectedOrder.status === 'pending' || selectedOrder.status === 'PENDING'
                        ? 'Pending'
                        : selectedOrder.status || 'Unknown'}
                    </span>
                  </div>

                  {/* Sticker Image and Name */}
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <div className="relative w-full md:w-48 h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={selectedOrder.sticker.image_url || selectedOrder.sticker.imagePreview || selectedOrder.sticker.image || 'https://via.placeholder.com/300'}
                          alt={selectedOrder.sticker.name || 'Sticker'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex'
                            }
                          }}
                        />
                        <div className="hidden text-gray-400 text-sm items-center justify-center h-full bg-gray-100">
                          <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>Image Preview</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 flex-1">
                          {selectedOrder.sticker.name || 'Custom Sticker'}
                        </h3>
                        <button
                          onClick={() => {
                            handleDownload(selectedOrder)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      </div>
                      {selectedOrder.sticker.category && (
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-4">
                          {selectedOrder.sticker.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Unit Price</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPriceWithCurrency(selectedOrder.price, selectedOrder.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Quantity</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedOrder.quantity}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className="text-xl font-bold text-purple-600">
                        {formatPriceWithCurrency(selectedOrder.price * selectedOrder.quantity, selectedOrder.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  {selectedOrder.sticker.specifications && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Specifications</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedOrder.sticker.specifications.size && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Size</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedOrder.sticker.specifications.size}
                            </div>
                          </div>
                        )}
                        {selectedOrder.sticker.specifications.finish && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Finish</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedOrder.sticker.specifications.finish}
                            </div>
                          </div>
                        )}
                        {selectedOrder.sticker.specifications.quantity && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Pack</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedOrder.sticker.specifications.quantity}
                            </div>
                          </div>
                        )}
                        {selectedOrder.sticker.specifications.shape && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Shape</div>
                            <div className="text-sm font-medium text-gray-900">
                              {selectedOrder.sticker.specifications.shape}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyOrders

