import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StickerCard from './StickerCard';

const BrowseCategories = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  // Category-specific gradient colors for placeholder images
  const getCategoryGradient = (categoryName) => {
    const gradients = {
      'Smile': 'from-yellow-400 via-orange-400 to-pink-400',
      'Funny': 'from-purple-400 via-pink-400 to-red-400',
      'Unicorn': 'from-pink-400 via-purple-400 to-indigo-400',
      'Safety': 'from-blue-400 via-cyan-400 to-teal-400',
      'Personalized': 'from-green-400 via-emerald-400 to-teal-400',
      'Christmas': 'from-red-500 via-green-500 to-red-500',
      'Valentine': 'from-pink-500 via-rose-400 to-red-400',
      'Sport': 'from-blue-500 via-blue-600 to-indigo-600',
    };
    return gradients[categoryName] || 'from-purple-400 via-pink-400 to-red-400';
  };

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch actual categories from the backend API
      console.log('🔄 Fetching categories from backend...')
      const response = await fetch('/api/templates/categories')
      
      console.log('📡 Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('✅ Categories fetched successfully from backend:')
      console.log('📦 Total categories:', data.length)
      console.table(data.map(cat => ({
        id: cat.id,
        name: cat.name,
        hasImage: !!(cat.imageUrl || cat.image_url),
        isPublished: cat.isPublished
      })))
      
      setCategories(data)
      console.log('✅ Categories state updated:', data)
    } catch (err) {
      console.error('❌ Error fetching categories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category) => {
    // Pass both category name and ID for better filtering
    const categoryData = {
      categoryName: category.name || category.title || 'Unknown',
      categoryId: category.id
    }
    navigate('/stickers', { state: categoryData })
  }

  return (
    <div className="bg-white pt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-textColor">Categories</h1>
        {!loading && categories.length > 0 && (
          <div className="text-sm text-gray-500">
            📦 {categories.length} categories from backend
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <p className="font-semibold">❌ Error fetching categories:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 text-lg">Loading Categories...</div>
        </div>
      ) : (
        /* Category Cards */
        <div className="flex gap-8 flex-wrap justify-center">
          {categories.length > 0 ? (
            categories.map(category => {
              // Handle both old format (title) and new format (name) for backward compatibility
              const categoryName = category.name || category.title || 'Unknown'
              // Handle both snake_case and camelCase for image URL
              const imageUrl = category.imageUrl || category.image_url || null
              return (
                <StickerCard
                  key={category.id}
                  imageSrc={imageUrl}
                  title={categoryName}
                  onClick={() => handleCategoryClick(category)}
                  gradientClass={getCategoryGradient(categoryName)}
                />
              )
            })
          ) : (
            <div className="text-gray-500 text-lg py-12">
              No categories found
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BrowseCategories

