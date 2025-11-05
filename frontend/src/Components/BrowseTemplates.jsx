import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StickerCard from './StickerCard';

const BrowseTemplates = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCategories()
    fetchTemplates()
  }, [])

  useEffect(() => {
    fetchTemplates(selectedCategory)
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/templates/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err.message)
    }
  }

  const fetchTemplates = async (categoryId = null) => {
    try {
      setLoading(true)
      const url = categoryId 
        ? `/api/templates?category=${categoryId}`
        : '/api/templates'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateClick = (templateTitle) => {
    navigate('/stickers', { state: { templateTitle } })
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="bg-white pt-10">
      <h1 className="text-3xl font-semibold text-textColor mb-6">Browse Templates</h1>
      
      {/* Categories */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map(cat => (
          <button 
            key={cat.id} 
            onClick={() => handleCategoryClick(cat.id)}
            className={`font-semibold py-2 px-4 rounded-md cursor-pointer transition ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-buttonColorst to-buttonColorend text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 text-lg">Loading templates...</div>
        </div>
      ) : (
        /* Sticker Cards */
        <div className="flex gap-8 flex-wrap justify-center">
          {templates.length > 0 ? (
            templates.map(template => (
              <StickerCard
                key={template.id}
                imageSrc={template.image_url}
                title={template.title}
                onClick={() => handleTemplateClick(template.title)}
              />
            ))
          ) : (
            <div className="text-gray-500 text-lg py-12">
              No templates found{selectedCategory ? ' in this category' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BrowseTemplates;