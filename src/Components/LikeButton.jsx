import React, { useState, useEffect } from 'react'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'

const LikeButton = ({ stickerId, stickerType = 'user_created', initialLikeCount = 0, initialIsLiked = false, size = 'medium' }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsLiked(initialIsLiked)
    setLikeCount(initialLikeCount)
  }, [initialIsLiked, initialLikeCount])

  const handleLike = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login to like stickers')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/likes/toggle/${stickerId}?stickerType=${stickerType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikeCount(data.likeCount)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to like sticker')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to like sticker')
    } finally {
      setLoading(false)
    }
  }

  const iconSize = size === 'small' ? 'text-lg' : size === 'large' ? 'text-2xl' : 'text-xl'
  const buttonSize = size === 'small' ? 'p-1' : size === 'large' ? 'p-3' : 'p-2'

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`${buttonSize} rounded-full transition-all ${
        isLiked
          ? 'text-red-500 hover:bg-red-50'
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      {isLiked ? (
        <FavoriteIcon className={iconSize} />
      ) : (
        <FavoriteBorderIcon className={iconSize} />
      )}
      {likeCount > 0 && (
        <span className={`ml-1 ${size === 'small' ? 'text-xs' : 'text-sm'} font-semibold`}>
          {likeCount}
        </span>
      )}
    </button>
  )
}

export default LikeButton

