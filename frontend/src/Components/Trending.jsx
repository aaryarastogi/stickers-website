import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import StickerCard from './StickerCard'

const Trending = () => {
  const navigate = useNavigate()
  const [trendingTemplates, setTrendingTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrendingTemplates()
  }, [])

  const fetchTrendingTemplates = async () => {
    try {
      const response = await fetch('/api/templates?trending=true')
      if (!response.ok) throw new Error('Failed to fetch trending templates')
      const data = await response.json()
      setTrendingTemplates(data)
    } catch (err) {
      console.error('Error fetching trending templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateClick = (templateTitle) => {
    navigate('/stickers', { state: { templateTitle } })
  }

  return (
    <div className="bg-white pt-10">
      <h1 className="text-3xl font-semibold text-textColor mb-6">Trending 🔥</h1>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500 text-lg">Loading trending templates...</div>
        </div>
      ) : trendingTemplates.length > 0 ? (
        <Carousel className="w-full sm:w-[90%] md:w-[80%] mx-auto">
          <CarouselContent className="-ml-2 md:-ml-4">
            {trendingTemplates.map((template) => (
              <CarouselItem key={template.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <StickerCard
                    imageSrc={template.image_url}
                    title={template.title}
                    onClick={() => handleTemplateClick(template.title)}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div className="text-gray-500 text-lg py-12 text-center">
          No trending templates available
        </div>
      )}
    </div>
  )
}

export default Trending