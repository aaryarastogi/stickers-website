import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import LikeButton from './LikeButton'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'

const Trending = () => {
  const navigate = useNavigate()
  const [trendingStickers, setTrendingStickers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingStickers()
  }, [])

  const fetchTrendingStickers = async () => {
    try {
      // Fetch top 5 liked stickers from user-created stickers
      const token = localStorage.getItem('token')
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch('/api/templates/trending/stickers', { headers })
      if (!response.ok) throw new Error('Failed to fetch trending stickers')
      const data = await response.json()
      // Backend already returns top 5, so no need to slice
      setTrendingStickers(data)
    } catch (err) {
      console.error('Error fetching trending stickers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStickerClick = (sticker) => {
    // If it's a template sticker, navigate to stickers page
    if (sticker.template_title) {
      navigate('/stickers', { state: { templateTitle: sticker.template_title } })
    }
    // For user-created stickers, don't navigate (or navigate to profile)
  }

  return (
    <div className="bg-white pt-10">
      <h1 className="text-3xl font-semibold text-textColor mb-6">Trending</h1>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 text-lg">Loading trending stickers...</div>
        </div>
      ) : trendingStickers.length > 0 ? (
        <Carousel className="w-full sm:w-[90%] md:w-[80%] mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {trendingStickers.map((sticker) => (
              <CarouselItem key={sticker.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <div className='flex flex-col'>
                    <div
                      className="relative flex flex-col items-center transition-transform duration-300 rounded-2xl overflow-hidden shadow-lg w-72 cursor-pointer group"
                      onClick={() => {
                        // Navigate to sticker detail page
                        // Use sticker_type from backend, fallback to checking template_title for backward compatibility
                        const stickerType = sticker.sticker_type || (sticker.template_id ? 'template' : 'user_created')
                        navigate(`/sticker/${stickerType}/${sticker.id}`)
                      }}
                    >
                      <img
                        src={sticker.image_url}
                        alt={sticker.name}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-75"
                      />
                      
                      {/* Purchase Count Overlay - Shows on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out flex items-end justify-center pb-8 z-20">
                        <div className="transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out flex flex-col items-center gap-3">
                          <div className="flex items-center gap-3 bg-white/98 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-300 animate-pulse-slow">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-2.5 shadow-lg ring-2 ring-green-200/50">
                              <ShoppingCartIcon className="text-white" fontSize="small" />
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider leading-tight">Purchased by</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-extrabold text-gray-900 leading-none">
                                  {sticker.purchase_count || sticker.sold_count || sticker.buy_count || 0}
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-gray-600 font-bold ml-1 whitespace-nowrap">people</span>
                          </div>
                          <div className="text-white/95 text-xs font-semibold animate-bounce-slow flex items-center gap-1">
                            <span>✨</span>
                            <span>Popular Choice</span>
                          </div>
                        </div>
                      </div>

                      {/* Like Button - Show for all stickers */}
                      {sticker.id && (
                        <div 
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <LikeButton
                            stickerId={sticker.id}
                            stickerType={sticker.sticker_type || (sticker.template_id ? "template" : "user_created")}
                            initialLikeCount={sticker.like_count || 0}
                            initialIsLiked={sticker.is_liked || false}
                            size="small"
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-800 text-base font-medium text-center">
                        {sticker.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="text-gray-500 text-lg py-12 text-center">
          No trending stickers available
        </div>
      )}
    </div>
  )
}

export default Trending