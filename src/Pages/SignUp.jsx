import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GoogleIcon from '@mui/icons-material/Google'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { setUserInStorage } from '../utils/storageUtils'

const SignUp = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const googleButtonRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
        // Use utility to store only essential user data
        setUserInStorage(data.user)
      }

      // Navigate to success page
      navigate('/signup-success')
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.')
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = useCallback(async (credentialResponse) => {
    setError('')
    setGoogleLoading(true)

    try {
      // Extract the credential string from the CredentialResponse object
      const credential = credentialResponse?.credential || credentialResponse
      
      if (!credential || typeof credential !== 'string') {
        throw new Error('Invalid Google credential received')
      }

      console.log('Sending Google credential to backend...')
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential,
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Google sign up failed')
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token)
        const success = setUserInStorage(data.user)
        if (!success) {
          setError('Failed to save user data. Please try again.')
          return
        }
        window.dispatchEvent(new Event('userLogin'))
      } else {
        throw new Error('No token received from server')
      }

      // Redirect to home
      navigate('/')
    } catch (err) {
      setError(err.message || 'Google sign up failed. Please try again.')
      console.error('Google sign up error:', err)
    } finally {
      setGoogleLoading(false)
    }
  }, [navigate])

  useEffect(() => {
    // Wait for Google script to load
    const initGoogleSignIn = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '589692016470-00s0683tvsvn3jtr1f0l5susmhu9hu6g.apps.googleusercontent.com'
      
      if (!clientId) {
        console.error('Google Client ID is missing!')
        setError('Google Sign Up is not configured. Please contact support.')
        return
      }

      if (window.google && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleSignUp,
            auto_select: false,
            cancel_on_tap_outside: true,
          })

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signup_with',
              width: '100%',
            }
          )
          console.log('Google Sign Up button initialized successfully')
        } catch (error) {
          console.error('Error initializing Google Sign Up:', error)
          setError('Failed to initialize Google Sign Up. Please refresh the page.')
        }
      } else {
        console.warn('Google script or button ref not available')
      }
    }

    // Check if Google script is already loaded
    if (window.google) {
      initGoogleSignIn()
    } else {
      // Wait for script to load
      let attempts = 0
      const maxAttempts = 100 // 10 seconds
      const checkGoogle = setInterval(() => {
        attempts++
        if (window.google) {
          clearInterval(checkGoogle)
          initGoogleSignIn()
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogle)
          console.error('Google script failed to load')
          setError('Google Sign Up script failed to load. Please check your internet connection and refresh the page.')
        }
      }, 100)
    }
  }, [handleGoogleSignUp])

  return (
    <div className='flex h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 overflow-hidden'>
      {/* Left Section - Signup Form */}
      <div className='flex-1 flex items-center justify-center p-8 min-w-0'>
        <div className='w-full max-w-md'>
          {/* Logo and Header */}
          <div className='flex items-center justify-between mb-8'>
            <button 
              onClick={() => navigate('/')}
              className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity'
            >
              <div className='relative'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-300 to-blue-300 rounded-lg transform rotate-12 shadow-lg'></div>
                <div className='absolute -top-1 -left-1 w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded-lg opacity-80'></div>
              </div>
              <span className='text-2xl font-bold text-gray-900'>Stickkery</span>
            </button>
            <Link to='/login' className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
              Have an account? Sign in
            </Link>
          </div>

          {/* Title */}
          <h1 className='text-4xl font-bold text-gray-900 mb-8'>Sign up</h1>

          {/* Social Login Buttons */}
          <div ref={googleButtonRef} className='flex-1 mb-6'></div>

          {googleLoading && (
            <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm text-center'>
              Signing up with Google...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm'>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Name Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Full Name
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white'
                placeholder='John Doe'
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Username or Email Address
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white'
                placeholder='hello@example.com'
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Password
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white pr-12'
                  placeholder='••••••'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white pr-12'
                  placeholder='••••••'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-black hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-lg'
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Section - Illustrative Background */}
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

        {/* Large White Panels (like washing machines) */}
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

export default SignUp
