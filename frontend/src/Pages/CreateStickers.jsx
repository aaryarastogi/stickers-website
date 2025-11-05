import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import heroImage from "../assets/stickers-hero.jpeg"
import aiImage from "../assets/ai-stickers.jpeg"
import customImage from "../assets/custom-stickers.jpeg"
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import PaletteIcon from '@mui/icons-material/Palette'
import SpeedIcon from '@mui/icons-material/Speed'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const CreateStickers = () => {
  const navigate = useNavigate()

  const features = [
    { icon: <SpeedIcon />, title: 'Fast Delivery', desc: '4-day turnaround guaranteed' },
    { icon: <PaletteIcon />, title: 'Unlimited Colors', desc: 'Choose from millions of colors' },
    { icon: <CheckCircleIcon />, title: 'Online Proofs', desc: 'Preview before printing' },
    { icon: <CloudUploadIcon />, title: 'Easy Upload', desc: 'Simple drag & drop interface' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      <Navbar />
      
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 pt-20 pb-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-100 border border-purple-200 mb-4 shadow-sm">
              <AutoAwesomeIcon className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Your Sticker Dreams Come True</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Create Stunning
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Custom Stickers
              </span>
            </h1>
            
            <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Bring your ideas to life with our easy-to-use sticker creation tools. Whether you upload your design or let AI create it for you, we've got you covered.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-4 shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options Grid - Enhanced */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Creation Method</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Select how you'd like to create your custom stickers
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Custom Stickers Card */}
            <div
              onClick={() => console.log("Custom stickers clicked")}
              className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-400 shadow-lg"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={customImage}
                  alt="Custom Stickers"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 to-pink-600/40 group-hover:opacity-50 transition-opacity duration-300" />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                  <span className="text-sm font-bold text-purple-600">Most Popular</span>
                </div>
              </div>
              
              <div className="p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                    <CloudUploadIcon />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Custom Stickers
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  Upload your own designs and create personalized stickers exactly the way you want them. Perfect for brands, artists, and unique expressions.
                </p>
                
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="text-green-500 text-sm" />
                    <span>Upload PNG, JPG, or SVG files</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="text-green-500 text-sm" />
                    <span>Full customization control</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="text-green-500 text-sm" />
                    <span>Professional printing quality</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/custom-sticker-creator')}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started
                  <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
                </button>
              </div>
            </div>

            {/* AI Generate Stickers Card */}
            <div
              onClick={() => console.log("AI stickers clicked")}
              className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-400 shadow-lg"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={aiImage}
                  alt="AI Generate Stickers"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-600/40 group-hover:opacity-50 transition-opacity duration-300" />
                
                {/* Badge */}
                <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full">
                  <span className="text-sm font-bold text-blue-600">AI Powered</span>
                </div>
              </div>
              
              <div className="p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <AutoAwesomeIcon />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    AI Generate Stickers
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-lg">
                  Describe your vision and watch AI create stunning stickers for you. Powered by advanced AI technology for unlimited creative possibilities.
                </p>
                
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="text-green-500 text-sm" />
                    <span>Text-to-image AI generation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="text-green-500 text-sm" />
                    <span>Instant creative results</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="text-green-500 text-sm" />
                    <span>Endless design variations</span>
                  </li>
                </ul>
                
                <button 
                  onClick={() => navigate('/ai-sticker-generator')}
                  className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  Try AI Generator
                  <span className="text-2xl transition-transform group-hover:translate-x-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers creating amazing stickers every day
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
          >
            Browse Templates
            <span className="text-xl">→</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default CreateStickers
