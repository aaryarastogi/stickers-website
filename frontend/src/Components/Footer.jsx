import React from 'react'
import { Link } from 'react-router-dom'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import YouTubeIcon from '@mui/icons-material/YouTube'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='relative'>
                <div className='w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg transform rotate-12 shadow-lg'></div>
                <div className='absolute -top-1 -left-1 w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg opacity-80'></div>
              </div>
              <span className='text-2xl font-bold'>Stickkery</span>
            </div>
            <p className='text-gray-400 text-sm leading-relaxed'>
              Create custom stickers that express your unique style. High-quality printing, endless customization options, and fast delivery.
            </p>
            {/* Social Media Icons */}
            <div className='flex gap-3 pt-2'>
              <a href='#' className='w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 transform hover:scale-110' aria-label='Facebook'>
                <FacebookIcon fontSize='small' />
              </a>
              <a href='#' className='w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gradient-to-br hover:from-blue-400 hover:to-cyan-500 rounded-full transition-all duration-300 transform hover:scale-110' aria-label='Twitter'>
                <TwitterIcon fontSize='small' />
              </a>
              <a href='#' className='w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gradient-to-br hover:from-pink-600 hover:to-purple-600 rounded-full transition-all duration-300 transform hover:scale-110' aria-label='Instagram'>
                <InstagramIcon fontSize='small' />
              </a>
              <a href='#' className='w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gradient-to-br hover:from-blue-700 hover:to-blue-800 rounded-full transition-all duration-300 transform hover:scale-110' aria-label='LinkedIn'>
                <LinkedInIcon fontSize='small' />
              </a>
              <a href='#' className='w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 rounded-full transition-all duration-300 transform hover:scale-110' aria-label='YouTube'>
                <YouTubeIcon fontSize='small' />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4 text-white'>Quick Links</h3>
            <ul className='space-y-2'>
              <li>
                <Link to='/' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Home
                </Link>
              </li>
              <li>
                <Link to='/createstickers' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Create Stickers
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Browse Templates
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  About Us
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='text-lg font-semibold mb-4 text-white'>Support</h3>
            <ul className='space-y-2'>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Help Center
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Returns
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  FAQs
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className='text-lg font-semibold mb-4 text-white'>Contact Us</h3>
            <ul className='space-y-3'>
              <li className='flex items-start gap-3'>
                <EmailIcon className='text-yellow-400 mt-1' fontSize='small' />
                <a href='mailto:support@stickkery.com' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  support@stickkery.com
                </a>
              </li>
              <li className='flex items-start gap-3'>
                <PhoneIcon className='text-yellow-400 mt-1' fontSize='small' />
                <a href='tel:+1234567890' className='text-gray-400 hover:text-white transition-colors duration-200 text-sm'>
                  +1 (234) 567-890
                </a>
              </li>
              <li className='flex items-start gap-3'>
                <LocationOnIcon className='text-yellow-400 mt-1' fontSize='small' />
                <span className='text-gray-400 text-sm'>
                  123 Sticker Street<br />
                  Design City, DC 12345
                </span>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className='mt-6'>
              <h4 className='text-sm font-semibold mb-2 text-white'>Newsletter</h4>
              <div className='flex gap-2'>
                <input
                  type='email'
                  placeholder='Your email'
                  className='flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-gray-400'
                />
                <button className='px-4 py-2 bg-gradient-to-r from-buttonColorst to-buttonColorend text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold'>
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='border-t border-gray-700 mt-8 pt-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-gray-400 text-sm'>
              © {currentYear} Stickkery. All rights reserved.
            </p>
            <div className='flex gap-6 text-sm'>
              <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200'>
                Privacy
              </Link>
              <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200'>
                Terms
              </Link>
              <Link to='#' className='text-gray-400 hover:text-white transition-colors duration-200'>
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

