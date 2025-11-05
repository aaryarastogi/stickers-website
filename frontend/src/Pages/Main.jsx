import React from 'react'
import Home from './Home'
import Navbar from './Navbar'
import Footer from '../Components/Footer'
import { useCart } from '../context/CartContext'

const Main = () => {
  const { openCart } = useCart()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <main className="flex-1">
        <Home/>
        <div className="flex justify-center px-4">
          <button 
            onClick={openCart}
            className="flex items-center justify-center bg-gradient-to-r from-buttonColorst to-buttonColorend py-3 px-6 sm:py-4 sm:px-8 text-base sm:text-xl font-semibold text-white/90 cursor-pointer capitalize my-4 sm:my-6 w-full max-w-xs sm:w-44 rounded-full hover:opacity-90 transition-opacity">
            view cart
          </button>
        </div>
      </main>
      <Footer/>
    </div>
  )
}

export default Main
