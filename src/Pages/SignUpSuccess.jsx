import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SignUpSuccess = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/login')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Cleanup on unmount
    return () => clearInterval(timer)
  }, [navigate])

  const handleGoToLogin = () => {
    navigate('/login')
  }

  return (
    <div className='flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 overflow-hidden'>
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='w-full max-w-md text-center'>
          {/* Success Icon */}
          <div className='mb-8 flex justify-center'>
            <div className='relative'>
              <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-12 h-12 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <div className='absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-ping'></div>
            </div>
          </div>

          {/* Success Message */}
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            Account Created!
          </h1>
          <p className='text-lg text-gray-600 mb-8'>
            Your account has been successfully created. You will be redirected to the login page in{' '}
            <span className='font-bold text-purple-600'>{countdown}</span> second{countdown !== 1 ? 's' : ''}.
          </p>

          {/* Manual Redirect Button */}
          <button
            onClick={handleGoToLogin}
            className='w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg mb-4'
          >
            Go to Login Now
          </button>

          {/* Back to Home Link */}
          <button
            onClick={() => navigate('/')}
            className='text-sm text-gray-600 hover:text-gray-800 font-medium'
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* Right Section - Illustrative Background (same as SignUp) */}
      <div className='hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-purple-200 via-pink-200 to-purple-300'>
        {/* Purple Ground */}
        <div className='absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-purple-400 to-purple-300 rounded-t-[60px] shadow-2xl'></div>

        {/* Yellow Worm/Slug Character */}
        <div className='absolute bottom-40 left-20 animate-bounce' style={{ animationDuration: '3s' }}>
          <div className='relative'>
            <div className='w-32 h-20 bg-yellow-400 rounded-full shadow-xl'></div>
            <div className='absolute top-2 left-4 w-6 h-6 bg-white rounded-full flex items-center justify-center'>
              <div className='w-4 h-4 bg-black rounded-full'></div>
            </div>
            <div className='absolute top-2 left-14 w-6 h-6 bg-white rounded-full flex items-center justify-center'>
              <div className='w-4 h-4 bg-black rounded-full'></div>
            </div>
            <div className='absolute top-0 left-8 w-3 h-3 bg-yellow-500 rounded-full'></div>
            <div className='absolute top-0 left-16 w-3 h-3 bg-yellow-500 rounded-full'></div>
          </div>
        </div>

        {/* White Ghost Character */}
        <div className='absolute bottom-56 left-40 animate-float'>
          <div className='relative'>
            <div className='w-24 h-28 bg-white rounded-t-full rounded-b-3xl shadow-xl'></div>
            <div className='absolute top-6 left-6 w-3 h-3 bg-black rounded-full'></div>
            <div className='absolute top-6 left-14 w-3 h-3 bg-black rounded-full'></div>
            <div className='absolute top-10 left-9 w-6 h-3 border-b-2 border-black rounded-full'></div>
          </div>
        </div>

        {/* Orange Cube */}
        <div className='absolute bottom-32 right-32 transform rotate-12 animate-float' style={{ animationDuration: '2.5s' }}>
          <div className='w-16 h-16 bg-orange-400 shadow-xl transform perspective-1000' style={{ transform: 'rotateX(15deg) rotateY(15deg)' }}>
            <div className='w-full h-full bg-gradient-to-br from-orange-500 to-orange-300 rounded-lg shadow-inner'></div>
          </div>
        </div>

        {/* White Tiles Stack */}
        <div className='absolute bottom-28 right-64 flex flex-col gap-1'>
          <div className='w-12 h-4 bg-white/90 rounded shadow-lg'></div>
          <div className='w-12 h-4 bg-white/90 rounded shadow-lg'></div>
          <div className='w-12 h-4 bg-white/90 rounded shadow-lg'></div>
        </div>

        {/* Yellow Cube */}
        <div className='absolute bottom-40 right-48 transform -rotate-12 animate-float' style={{ animationDuration: '3.5s' }}>
          <div className='w-14 h-14 bg-yellow-300 shadow-xl rounded-lg'></div>
        </div>

        {/* Cylinder Stack */}
        <div className='absolute bottom-28 right-16 flex flex-col items-center'>
          <div className='w-4 h-4 bg-orange-400 rounded-full mb-1 shadow-lg'></div>
          <div className='w-10 h-8 bg-pink-300 rounded-full shadow-lg'></div>
          <div className='w-12 h-10 bg-purple-300 rounded-full shadow-lg'></div>
          <div className='w-14 h-12 bg-amber-200 rounded-full shadow-lg'></div>
        </div>

        {/* Large White Panels */}
        <div className='absolute top-20 right-32'>
          <div className='w-32 h-40 bg-white rounded-2xl shadow-2xl relative'>
            <div className='absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
            </div>
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-50'></div>
          </div>
        </div>

        <div className='absolute top-32 right-64'>
          <div className='w-28 h-36 bg-white rounded-2xl shadow-2xl relative'>
            <div className='absolute top-3 left-1/2 transform -translate-x-1/2 flex gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <div className='w-3 h-3 bg-orange-500 rounded-full'></div>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
            </div>
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-50'></div>
          </div>
        </div>

        {/* Additional Decorative Elements */}
        <div className='absolute top-60 right-20 w-8 h-8 bg-pink-400 rounded-full opacity-60 animate-pulse'></div>
        <div className='absolute bottom-60 left-64 w-6 h-6 bg-blue-400 rounded-full opacity-60 animate-pulse' style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}

export default SignUpSuccess

