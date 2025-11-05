import React from 'react'
import { useNavigate } from 'react-router-dom'
import StickerCard from './StickerCard';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const stickers = [
  {
    imageSrc: 'https://template.canva.com/EAEVzH0z3xs/2/0/400w-DkzNIfSkjOg.jpg',
    title: 'Safety Sticker'
  },
  {
    imageSrc: 'https://template.canva.com/EAEVzPoOheA/5/0/400w-2fxPudgb_YU.jpg',
    title: 'Personalized Sticker'
  },
  {
    imageSrc: 'https://template.canva.com/EAELAsw9ajc/2/0/400w-_0IlWcZP25s.jpg',
    title: 'Christmas Sticker'
  },
  {
    imageSrc: 'https://template.canva.com/EAE1NypPdUc/3/0/400w-HU9xbqWQJf0.jpg',
    title: "Valentine's Day Sticker"
  },
  {
    imageSrc: 'https://template.canva.com/EADzBjUHBoM/1/0/400w-vcb5-2iejVI.jpg',
    title: "Sport Sticker"
  }
];

const categories = [
  'Oval', 'Circle Sticker', 'Illustration', 'Waxing', 'Splatter',
  'Smile', 'Santa Claus', 'Spelling', 'Mickey Mouse Template', 'Funny',
  'Paint', 'Volunteer', 'Unicorn', 'Aff'
];

const BrowseTemplates = () => {
  const navigate = useNavigate()

  const handleTemplateClick = (templateTitle) => {
    navigate('/stickers', { state: { templateTitle } })
  }

  return (
    <div className="bg-white pt-10">
      <h1 className="text-3xl font-semibold text-textColor mb-6">Browse Templates</h1>
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map(cat => (
          <button key={cat} className="bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-md cursor-pointer hover:underline hover:bg-gray-200 transition">
            {cat}
          </button>
        ))}
      </div>
      {/* Sticker Cards */}
      <div className="flex gap-8 flex-wrap justify-center">
        {stickers.map(sticker => (
          <StickerCard
            key={sticker.title}
            imageSrc={sticker.imageSrc}
            title={sticker.title}
            onClick={() => handleTemplateClick(sticker.title)}
          />
        ))}
      </div>
    </div>
  )
}

export default BrowseTemplates;