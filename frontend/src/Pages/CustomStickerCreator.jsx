import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import RotateRightIcon from '@mui/icons-material/RotateRight'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const CustomStickerCreator = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  
  // Customization options
  const [stickerName, setStickerName] = useState('')
  const [stickerCategory, setStickerCategory] = useState('')
  const [stickerSize, setStickerSize] = useState('3x3')
  const [stickerShape, setStickerShape] = useState('circle')
  const [quantity, setQuantity] = useState(50)
  const [finish, setFinish] = useState('glossy')
  const [imageZoom, setImageZoom] = useState(100)
  const [imageRotation, setImageRotation] = useState(0)
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sizes = [
    { value: '2x2', label: '2" × 2"', price: 0.50 },
    { value: '3x3', label: '3" × 3"', price: 0.75 },
    { value: '4x4', label: '4" × 4"', price: 1.00 },
    { value: '5x5', label: '5" × 5"', price: 1.50 },
    { value: 'custom', label: 'Custom Size', price: 2.00 }
  ]

  const shapes = ['circle', 'square', 'rectangle', 'rounded', 'die-cut']
  const finishes = ['glossy', 'matte', 'transparent', 'waterproof']

  // Calculate price
  const selectedSize = sizes.find(s => s.value === stickerSize)
  const basePrice = selectedSize ? selectedSize.price : 0.75
  const finishMultiplier = finish === 'waterproof' ? 1.3 : finish === 'transparent' ? 1.2 : 1.0
  const quantityDiscount = quantity >= 100 ? 0.9 : quantity >= 50 ? 0.95 : 1.0
  const totalPrice = (basePrice * quantity * finishMultiplier * quantityDiscount).toFixed(2)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with quality compression
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
          resolve(compressedDataUrl)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFile = async (file) => {
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (PNG, JPG, GIF, SVG)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size should be less than 10MB')
      return
    }

    try {
      // Compress image if it's large
      let compressedDataUrl
      if (file.size > 2 * 1024 * 1024) { // Compress if larger than 2MB
        compressedDataUrl = await compressImage(file)
      } else {
        const reader = new FileReader()
        compressedDataUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      }

      setImagePreview(compressedDataUrl)
      setUploadedImage(file)
    } catch (error) {
      console.error('Error processing image:', error)
      alert('Error processing image. Please try again.')
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePayNow = async () => {
    if (!uploadedImage) {
      alert('Please upload an image first')
      return
    }

    if (!stickerName.trim()) {
      alert('Please enter a name for your sticker')
      return
    }

    if (!stickerCategory.trim()) {
      alert('Please enter a category for your sticker')
      return
    }

    // Check if user is logged in (required for payment)
    const userData = localStorage.getItem('user')
    const user = userData ? JSON.parse(userData) : null

    if (!user) {
      alert('Please login to purchase stickers')
      navigate('/login', { 
        state: { 
          message: 'Please login to purchase stickers', 
          redirectTo: '/custom-sticker-creator' 
        } 
      })
      return
    }

    setIsSaving(true)

    try {
      // Always save to database (whether published or not)
      const stickerData = {
        user_id: user.id,
        name: stickerName.trim(),
        category: stickerCategory.trim(),
        image_url: imagePreview,
        specifications: {
          size: stickerSize,
          shape: stickerShape,
          quantity,
          finish,
          imageFile: uploadedImage.name
        },
        price: parseFloat(totalPrice),
        is_published: isPublished || false
      }

      const response = await fetch('/api/custom-stickers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stickerData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save sticker')
      }

      const savedSticker = await response.json()
      console.log('Sticker saved to database:', savedSticker)

      // Save to purchased stickers in localStorage
      const stickerItem = {
        id: savedSticker.id,
        name: savedSticker.name,
        category: savedSticker.category,
        price: parseFloat(savedSticker.price),
        quantity: 1,
        image_url: savedSticker.image_url,
        imagePreview: savedSticker.image_url,
        image: savedSticker.image_url,
        specifications: typeof savedSticker.specifications === 'string' 
          ? JSON.parse(savedSticker.specifications) 
          : savedSticker.specifications,
        purchaseDate: new Date().toISOString(),
        isPublished: savedSticker.is_published
      }

      // Save to purchased stickers
      const allPurchases = JSON.parse(localStorage.getItem('purchasedStickers') || '{}')
      const userKey = user.id || user.email
      if (!allPurchases[userKey]) {
        allPurchases[userKey] = []
      }
      allPurchases[userKey].push(stickerItem)
      localStorage.setItem('purchasedStickers', JSON.stringify(allPurchases))

      // Show success message
      alert(
        isPublished 
          ? 'Payment successful! Sticker created and published. It will be visible to other users.' 
          : 'Payment successful! Sticker created. You can publish it later from My Stickers.'
      )
      
      // Navigate to My Stickers page
      navigate('/my-stickers')
    } catch (error) {
      console.error('Error processing payment:', error)
      alert(`Payment failed: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/createstickers')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Create Stickers
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Create Custom Sticker
          </h1>
          <p className="text-gray-600 text-lg">
            Upload your design and customize your perfect sticker
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Design</h2>
              
              {!imagePreview ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                    dragActive
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <CloudUploadIcon className="text-6xl text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Drag & Drop your image here
                  </h3>
                  <p className="text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Browse Files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    Supported formats: PNG, JPG, GIF, SVG (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Preview */}
                  <div className="relative bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                    <div
                      className="relative"
                      style={{
                        transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={`max-w-full max-h-[300px] object-contain rounded-lg shadow-lg ${
                          stickerShape === 'circle' ? 'rounded-full' : 
                          stickerShape === 'rounded' ? 'rounded-2xl' : 
                          stickerShape === 'rectangle' ? 'rounded-md' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Image Controls */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setImageZoom(Math.max(50, imageZoom - 10))}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={imageZoom <= 50}
                      >
                        <ZoomOutIcon />
                      </button>
                      <span className="font-medium">{imageZoom}%</span>
                      <button
                        onClick={() => setImageZoom(Math.min(200, imageZoom + 10))}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={imageZoom >= 200}
                      >
                        <ZoomInIcon />
                      </button>
                      <div className="w-px h-6 bg-gray-300"></div>
                      <button
                        onClick={() => setImageRotation(imageRotation - 90)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <RotateLeftIcon />
                      </button>
                      <button
                        onClick={() => setImageRotation(imageRotation + 90)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <RotateRightIcon />
                      </button>
                    </div>
                    <button
                      onClick={removeImage}
                      className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <DeleteIcon fontSize="small" />
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customization Options */}
            {imagePreview && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize Your Sticker</h2>
                
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sticker Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stickerName}
                    onChange={(e) => setStickerName(e.target.value)}
                    placeholder="Enter a name for your sticker"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                {/* Category Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stickerCategory}
                    onChange={(e) => setStickerCategory(e.target.value)}
                    placeholder="Enter a category (e.g., Business, Personal, Event)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                
                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sticker Size
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setStickerSize(size.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          stickerSize === size.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{size.label}</div>
                        <div className="text-sm text-gray-600">${size.price.toFixed(2)} each</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sticker Shape
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {shapes.map((shape) => (
                      <button
                        key={shape}
                        onClick={() => setStickerShape(shape)}
                        className={`p-4 rounded-lg border-2 capitalize transition-all ${
                          stickerShape === shape
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quantity: {quantity} stickers
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="500"
                    step="25"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25</span>
                    <span>500</span>
                  </div>
                </div>

                {/* Finish Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Finish Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {finishes.map((finishOption) => (
                      <button
                        key={finishOption}
                        onClick={() => setFinish(finishOption)}
                        className={`p-4 rounded-lg border-2 capitalize transition-all ${
                          finish === finishOption
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {finishOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Publish Option */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">Publish this sticker</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Allow other users to see and purchase your sticker design
                      </p>
                    </div>
                  </label>
                  {!localStorage.getItem('user') && isPublished && (
                    <p className="text-sm text-orange-600 mt-2 ml-8">
                      ⚠️ You need to be logged in to publish stickers
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {imagePreview ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Size:</span>
                      <span className="font-semibold">{selectedSize?.label}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shape:</span>
                      <span className="font-semibold capitalize">{stickerShape}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Quantity:</span>
                      <span className="font-semibold">{quantity}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Finish:</span>
                      <span className="font-semibold capitalize">{finish}</span>
                    </div>
                    {quantityDiscount < 1 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircleIcon fontSize="small" />
                          <span className="text-sm font-semibold">
                            {((1 - quantityDiscount) * 100).toFixed(0)}% Quantity Discount Applied!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-purple-600">${totalPrice}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      ${(totalPrice / quantity).toFixed(2)} per sticker
                    </p>
                  </div>

                  <button
                    onClick={handlePayNow}
                    disabled={isSaving}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pay Now
                      </>
                    )}
                  </button>
                  {isPublished && (
                    <p className="text-sm text-center text-purple-600 mt-2">
                      This sticker will be visible to other users after payment
                    </p>
                  )}
                  {!localStorage.getItem('user') && (
                    <p className="text-sm text-center text-orange-600 mt-2">
                      ⚠️ Please login to purchase stickers
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Upload an image to see pricing</p>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="bg-purple-50 rounded-xl p-6 mt-6 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Use high-resolution images (300 DPI)</li>
                <li>• PNG with transparent background recommended</li>
                <li>• Minimum size: 2" × 2"</li>
                <li>• 4-day turnaround time</li>
                <li>• Free shipping on orders over $50</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomStickerCreator

