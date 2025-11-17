import React from 'react'
import HomePage1 from '../Components/HomePage1'
import BrowseCategories from '../Components/BrowseCategories'
import Trending from '../Components/Trending'
import PublishedStickers from '../Components/PublishedStickers'

const Home = () => {
  return (
    <div className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
      <HomePage1/>
      <Trending/>
      <BrowseCategories/>
      <PublishedStickers/>
    </div>
  )
}

export default Home
