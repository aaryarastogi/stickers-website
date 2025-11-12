import React from 'react'
import { useNavigate } from 'react-router-dom'
import ConstructionIcon from '@mui/icons-material/Construction'
import HomeIcon from '@mui/icons-material/Home'

const ComingSoon = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Main Content Card */}
        <div className="p-12 md:p-20">
          {/* Animated Icon Container */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative w-40 h-40 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                <ConstructionIcon sx={{ fontSize: 80, color: 'white' }} />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Coming Soon
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-semibold text-gray-700 mb-6">
            Something Amazing is on the Way!
          </p>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-16 max-w-lg mx-auto leading-relaxed">
            We're crafting something special for you. This feature is currently under development and will be available soon. Thank you for your patience!
          </p>

          {/* Back to Home Button */}
          <button
            onClick={() => navigate('/')}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 cursor-pointer transition-opacity duration-300"></span>
            <HomeIcon sx={{ fontSize: 24 }} className="relative z-10" />
            <span className="relative z-10">Back to Home</span>
          </button>

          {/* Decorative Animated Dots */}
          <div className="mt-20 flex justify-center gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-gray-500 text-sm">
          Need help? <a href="mailto:support@stickkery.com" className="text-purple-600 hover:text-purple-700 font-medium underline transition-colors">Contact Support</a>
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}

export default ComingSoon

