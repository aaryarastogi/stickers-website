import React from 'react'
import HomePage1 from '../Components/HomePage1'
import BrowseTemplates from '../Components/BrowseTemplates'
import Trending from '../Components/Trending'

const Home = () => {
  return (
    <div className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16'>
      <HomePage1/>
      <Trending/>
      <BrowseTemplates/>
    </div>
  )
}

export default Home
