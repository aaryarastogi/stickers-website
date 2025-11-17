import React, { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext()

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

// Currency configuration
const CURRENCIES = {
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  RU: { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' }
}

// Exchange rates (base: USD = 1.0)
// Note: These are approximate rates, you may want to use a real-time API
const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 83.0,      // 1 USD = 83 INR (approximate)
  GBP: 0.79,      // 1 USD = 0.79 GBP (approximate)
  CAD: 1.35,      // 1 USD = 1.35 CAD (approximate)
  AED: 3.67,      // 1 USD = 3.67 AED (approximate)
  EUR: 0.92,      // 1 USD = 0.92 EUR (approximate)
  RUB: 92.0,      // 1 USD = 92 RUB (approximate)
  AUD: 1.52       // 1 USD = 1.52 AUD (approximate)
}

// Country code to currency mapping
const COUNTRY_TO_CURRENCY = {
  IN: 'INR',
  GB: 'GBP',
  US: 'USD',
  CA: 'CAD',
  AE: 'AED',
  DE: 'EUR',
  RU: 'RUB',
  AU: 'AUD'
}

// Detect country from browser locale or IP
const detectCountry = async () => {
  // Check if user has manually selected a currency - if yes, respect that preference
  const manualSelection = localStorage.getItem('manualCurrencySelection')
  if (manualSelection === 'true') {
    const savedCountry = localStorage.getItem('preferredCountry')
    if (savedCountry && COUNTRY_TO_CURRENCY[savedCountry]) {
      return savedCountry
    }
  }

  // Try IP-based geolocation FIRST (most accurate method) - automatic detection
  try {
    // Use Promise.race with timeout to prevent hanging (3 seconds timeout)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    )
    
    const fetchPromise = fetch('https://ipapi.co/json/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    const response = await Promise.race([fetchPromise, timeoutPromise])
    
    if (response && response.ok) {
      const data = await response.json()
      const countryCode = data.country_code
      if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
        // Save detected country to localStorage for future visits (for faster loading)
        localStorage.setItem('detectedCountry', countryCode)
        console.log(`Currency auto-detected: ${countryCode} based on IP location`)
        return countryCode
      }
    }
  } catch (e) {
    console.log('IP geolocation not available, trying browser locale...', e.message)
    // Continue to other detection methods
  }

  // Try to detect from browser locale (automatic detection)
  try {
    const locale = navigator.language || navigator.userLanguage || 'en-US'
    const countryCode = locale.split('-')[1]?.toUpperCase()
    
    if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
      localStorage.setItem('detectedCountry', countryCode)
      console.log(`Currency auto-detected: ${countryCode} based on browser locale`)
      return countryCode
    }
    
    // Try to map common locale patterns
    if (locale.toLowerCase().includes('en-in') || locale.toLowerCase().includes('hi')) {
      localStorage.setItem('detectedCountry', 'IN')
      console.log('Currency auto-detected: IN based on locale pattern')
      return 'IN'
    }
    if (locale.toLowerCase().includes('en-gb')) {
      localStorage.setItem('detectedCountry', 'GB')
      console.log('Currency auto-detected: GB based on locale pattern')
      return 'GB'
    }
    if (locale.toLowerCase().includes('en-au')) {
      localStorage.setItem('detectedCountry', 'AU')
      console.log('Currency auto-detected: AU based on locale pattern')
      return 'AU'
    }
    if (locale.toLowerCase().includes('en-ca')) {
      localStorage.setItem('detectedCountry', 'CA')
      console.log('Currency auto-detected: CA based on locale pattern')
      return 'CA'
    }
    if (locale.toLowerCase().includes('de') || locale.toLowerCase().includes('de-de')) {
      localStorage.setItem('detectedCountry', 'DE')
      console.log('Currency auto-detected: DE based on locale pattern')
      return 'DE'
    }
    if (locale.toLowerCase().includes('ru') || locale.toLowerCase().includes('ru-ru')) {
      localStorage.setItem('detectedCountry', 'RU')
      console.log('Currency auto-detected: RU based on locale pattern')
      return 'RU'
    }
    if (locale.toLowerCase().includes('ar') || locale.toLowerCase().includes('ar-ae')) {
      localStorage.setItem('detectedCountry', 'AE')
      console.log('Currency auto-detected: AE based on locale pattern')
      return 'AE'
    }
  } catch (e) {
    console.error('Error detecting country from locale:', e)
  }

  // Check if we have a previously auto-detected country in localStorage (for faster loading)
  const detectedCountry = localStorage.getItem('detectedCountry')
  if (detectedCountry && COUNTRY_TO_CURRENCY[detectedCountry] && manualSelection !== 'true') {
    console.log(`Using previously detected country: ${detectedCountry}`)
    return detectedCountry
  }

  // Default to USD if all detection methods fail
  console.log('Currency detection failed, defaulting to USD')
  return 'US'
}

export const CurrencyProvider = ({ children }) => {
  const [country, setCountry] = useState('US')
  const [currency, setCurrency] = useState(CURRENCIES.US)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeCurrency = async () => {
      setIsLoading(true)
      try {
        // Automatically detect country based on user's location
        const detectedCountry = await detectCountry()
        setCountry(detectedCountry)
        const currencyCode = COUNTRY_TO_CURRENCY[detectedCountry] || 'USD'
        setCurrency(CURRENCIES[detectedCountry] || CURRENCIES.US)
        
        // Only save if user hasn't manually set a preference
        // Check if user has manually selected a currency (not auto-detected)
        const manualPreference = localStorage.getItem('manualCurrencySelection')
        if (!manualPreference) {
          localStorage.setItem('preferredCountry', detectedCountry)
          localStorage.setItem('preferredCurrency', currencyCode)
          localStorage.setItem('detectedCountry', detectedCountry)
        }
      } catch (error) {
        console.error('Error initializing currency:', error)
        // Fallback to previously detected country or USD
        const savedCountry = localStorage.getItem('detectedCountry') || 'US'
        setCountry(savedCountry)
        setCurrency(CURRENCIES[savedCountry] || CURRENCIES.US)
      } finally {
        setIsLoading(false)
      }
    }

    initializeCurrency()
  }, [])

  const setCountryManually = (countryCode) => {
    if (COUNTRY_TO_CURRENCY[countryCode]) {
      setCountry(countryCode)
      setCurrency(CURRENCIES[countryCode])
      localStorage.setItem('preferredCountry', countryCode)
      localStorage.setItem('preferredCurrency', COUNTRY_TO_CURRENCY[countryCode])
      localStorage.setItem('manualCurrencySelection', 'true') // Mark as manual selection
    }
  }

  const convertPrice = (priceInUSD) => {
    const currencyCode = currency.code
    const rate = EXCHANGE_RATES[currencyCode] || 1.0
    return priceInUSD * rate
  }

  const formatPrice = (priceInUSD, decimals = 2) => {
    const convertedPrice = convertPrice(priceInUSD)
    return `${currency.symbol}${convertedPrice.toFixed(decimals)}`
  }

  // Format price with a specific currency (for stickers that have their own currency)
  // This displays the price in the sticker's original currency without conversion
  const formatPriceWithCurrency = (price, currencyCode, decimals = 2) => {
    if (!price || price === 0) {
      const defaultCurrency = CURRENCIES.US || { symbol: '$' }
      return `${defaultCurrency.symbol}0.00`
    }
    
    const currencyCodeUpper = (currencyCode || 'USD').toUpperCase()
    // Map currency codes to country codes for lookup
    const currencyToCountry = {
      'INR': 'IN',
      'GBP': 'GB',
      'USD': 'US',
      'CAD': 'CA',
      'AED': 'AE',
      'EUR': 'DE',
      'RUB': 'RU',
      'AUD': 'AU'
    }
    const countryCode = currencyToCountry[currencyCodeUpper] || 'US'
    const currencyInfo = CURRENCIES[countryCode] || CURRENCIES.US
    const priceNum = typeof price === 'string' ? parseFloat(price) : price
    
    return `${currencyInfo.symbol}${priceNum.toFixed(decimals)}`
  }

  // Convert price from one currency to another
  const convertPriceFromCurrency = (price, fromCurrency, toCurrency) => {
    if (!price || price === 0) return 0
    
    const fromCurrencyUpper = (fromCurrency || 'USD').toUpperCase()
    const toCurrencyUpper = (toCurrency || 'USD').toUpperCase()
    
    // If same currency, no conversion needed
    if (fromCurrencyUpper === toCurrencyUpper) {
      return typeof price === 'string' ? parseFloat(price) : price
    }
    
    const priceNum = typeof price === 'string' ? parseFloat(price) : price
    
    // Convert from source currency to USD first
    const priceInUSD = priceNum / (EXCHANGE_RATES[fromCurrencyUpper] || 1.0)
    // Then convert from USD to target currency
    const convertedPrice = priceInUSD * (EXCHANGE_RATES[toCurrencyUpper] || 1.0)
    
    return convertedPrice
  }

  // Format sticker price - converts from sticker's currency to user's currency and displays
  const formatStickerPrice = (price, stickerCurrency, decimals = 2) => {
    if (!price || price === 0) {
      return `${currency.symbol}0.00`
    }
    
    // Convert from sticker's currency to user's selected currency
    const convertedPrice = convertPriceFromCurrency(price, stickerCurrency, currency.code)
    
    return `${currency.symbol}${convertedPrice.toFixed(decimals)}`
  }

  const value = {
    country,
    currency,
    setCountry: setCountryManually,
    convertPrice,
    formatPrice,
    formatPriceWithCurrency,
    convertPriceFromCurrency,
    formatStickerPrice,
    isLoading,
    currencies: CURRENCIES,
    exchangeRates: EXCHANGE_RATES
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

