import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useCart } from '../context/CartContext'
import { useCurrency } from '../context/CurrencyContext'
import { generateAIImage } from '../services/aiImageService'
import { validatePromptForSticker } from '@/utils/promptFilter'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import GenerateIcon from '@mui/icons-material/Animation'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ImageIcon from '@mui/icons-material/Image'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'

const AIStickerGenerator = () => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [generationHistory, setGenerationHistory] = useState([])
  const [validationError, setValidationError] = useState(null)
  
  // Customization options
  const [stickerSize, setStickerSize] = useState('3x3')
  const [stickerShape, setStickerShape] = useState('circle')
  const [quantity, setQuantity] = useState(50)
  const [finish, setFinish] = useState('glossy')
  const [aiStyle, setAiStyle] = useState('realistic')
  const [colorScheme, setColorScheme] = useState('vibrant')

  const sizes = [
    { value: '2x2', label: '2" × 2"', price: 0.50 },
    { value: '3x3', label: '3" × 3"', price: 0.75 },
    { value: '4x4', label: '4" × 4"', price: 1.00 },
    { value: '5x5', label: '5" × 5"', price: 1.50 },
    { value: 'custom', label: 'Custom Size', price: 2.00 }
  ]

  const shapes = ['circle', 'square', 'rectangle', 'rounded', 'die-cut']
  const finishes = ['glossy', 'matte', 'transparent', 'waterproof']
  const aiStyles = [
    { value: 'realistic', label: 'Realistic', icon: '🎨' },
    { value: 'cartoon', label: 'Cartoon', icon: '🎭' },
    { value: 'minimalist', label: 'Minimalist', icon: '✨' },
    { value: 'vintage', label: 'Vintage', icon: '📸' },
    { value: '3d', label: '3D', icon: '🔮' },
    { value: 'watercolor', label: 'Watercolor', icon: '🖌️' }
  ]
  const colorSchemes = ['vibrant', 'pastel', 'monochrome', 'neon', 'natural']

  // Calculate price
  const selectedSize = sizes.find(s => s.value === stickerSize)
  const basePrice = selectedSize ? selectedSize.price : 0.75
  const finishMultiplier = finish === 'waterproof' ? 1.3 : finish === 'transparent' ? 1.2 : 1.0
  const quantityDiscount = quantity >= 100 ? 0.9 : quantity >= 50 ? 0.95 : 1.0
  const aiGenerationFee = 2.00 // AI generation fee
  const totalPrice = ((basePrice * quantity * finishMultiplier * quantityDiscount) + aiGenerationFee).toFixed(2)

  // Generate a unique visual representation based on prompt
  const generateStickerImage = (promptText, style, colorScheme) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      canvas.width = 400
      canvas.height = 400
      const ctx = canvas.getContext('2d')
      
      // Color schemes
      const colorMap = {
        vibrant: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8B94', '#95E1D3', '#FFA07A'],
        pastel: ['#FFB6C1', '#B0E0E6', '#FFDAB9', '#E0BBE4', '#F0E68C', '#DDA0DD'],
        monochrome: ['#2C2C2C', '#4A4A4A', '#6B6B6B', '#8C8C8C', '#ADADAD', '#CECECE'],
        neon: ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#00FFFF', '#FFFF00'],
        natural: ['#8B4513', '#228B22', '#4682B4', '#D2691E', '#2F4F4F', '#CD853F']
      }
      
      const colors = colorMap[colorScheme] || colorMap.vibrant
      const promptLower = promptText.toLowerCase()
      
      // Generate unique seed from prompt for consistent but varied results
      const seed = promptText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const random = (max) => {
        const x = Math.sin(seed + max) * 10000
        return Math.abs((x - Math.floor(x)) * max)
      }
      
      // Create unique background based on prompt
      const bgType = Math.floor(random(4))
      ctx.globalAlpha = 1
      
      if (bgType === 0) {
        // Gradient
        const gradient = ctx.createLinearGradient(0, 0, 400, 400)
        gradient.addColorStop(0, colors[Math.floor(random(colors.length))])
        gradient.addColorStop(0.5, colors[Math.floor(random(colors.length))])
        gradient.addColorStop(1, colors[Math.floor(random(colors.length))])
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 400, 400)
      } else if (bgType === 1) {
        // Radial gradient
        const gradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 200)
        gradient.addColorStop(0, colors[Math.floor(random(colors.length))])
        gradient.addColorStop(1, colors[Math.floor(random(colors.length))])
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 400, 400)
      } else if (bgType === 2) {
        // Pattern background
        colors.forEach((color, i) => {
          ctx.fillStyle = color
          ctx.fillRect((i % 3) * 133, Math.floor(i / 3) * 200, 133, 200)
        })
      } else {
        // Solid with pattern overlay
        ctx.fillStyle = colors[Math.floor(random(colors.length))]
        ctx.fillRect(0, 0, 400, 400)
        for (let i = 0; i < 20; i++) {
          ctx.fillStyle = colors[Math.floor(random(colors.length))] + '40'
          ctx.fillRect(random(400), random(400), 50, 50)
        }
      }
      
      // Add style-based effects
      ctx.save()
      if (style === 'cartoon' || style === '3d') {
        ctx.shadowBlur = 20
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
      } else if (style === 'watercolor') {
        ctx.globalCompositeOperation = 'multiply'
        ctx.globalAlpha = 0.6
      } else if (style === 'minimalist') {
        ctx.globalAlpha = 0.8
      }
      
      // Detect and render based on common keywords
      const drawElements = []
      
      // Character/Animal detection (priority order matters)
      const characters = ['doraemon', 'pikachu', 'mickey', 'mario']
      characters.forEach(char => {
        if (promptLower.includes(char)) {
          drawElements.push({ type: 'character', keyword: char })
        }
      })
      
      // Animal detection
      const animals = ['cat', 'dog', 'bear', 'bird', 'fish', 'rabbit', 'tiger', 'lion', 'elephant', 'panda', 'fox', 'wolf', 'deer', 'cow', 'pig', 'horse']
      animals.forEach(animal => {
        if (promptLower.includes(animal) && drawElements.length === 0) {
          drawElements.push({ type: 'animal', keyword: animal })
        }
      })
      
      // Object detection
      if (promptLower.includes('star')) drawElements.push({ type: 'star', count: 3 + Math.floor(random(5)) })
      if (promptLower.includes('heart')) drawElements.push({ type: 'heart', count: 2 + Math.floor(random(4)) })
      if (promptLower.includes('flower')) drawElements.push({ type: 'flower', count: 2 + Math.floor(random(5)) })
      if (promptLower.includes('circle') || promptLower.includes('round')) drawElements.push({ type: 'circle', count: 3 + Math.floor(random(5)) })
      if (promptLower.includes('square') || promptLower.includes('box')) drawElements.push({ type: 'square', count: 2 + Math.floor(random(4)) })
      if (promptLower.includes('triangle')) drawElements.push({ type: 'triangle', count: 2 + Math.floor(random(4)) })
      
      // If no specific elements, create abstract pattern based on prompt
      if (drawElements.length === 0) {
        const patternType = Math.floor(random(4))
        if (patternType === 0) {
          drawElements.push({ type: 'abstract', shape: 'circles', count: 5 + Math.floor(random(8)) })
        } else if (patternType === 1) {
          drawElements.push({ type: 'abstract', shape: 'squares', count: 4 + Math.floor(random(6)) })
        } else if (patternType === 2) {
          drawElements.push({ type: 'abstract', shape: 'lines', count: 8 + Math.floor(random(12)) })
        } else {
          drawElements.push({ type: 'abstract', shape: 'mixed', count: 6 + Math.floor(random(8)) })
        }
      }
      
      // Draw detected elements
      drawElements.forEach(element => {
        if (element.type === 'star') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const size = 20 + random(40)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.8
            drawStar(ctx, x, y, 5, size, size / 2)
            ctx.fill()
          }
        } else if (element.type === 'heart') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const size = 30 + random(50)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.8
            drawHeart(ctx, x, y, size)
            ctx.fill()
          }
        } else if (element.type === 'flower') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const size = 30 + random(50)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.8
            drawFlower(ctx, x, y, size)
            ctx.fill()
          }
        } else if (element.type === 'circle') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const radius = 20 + random(60)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.7
            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        } else if (element.type === 'square') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const size = 30 + random(70)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.7
            ctx.fillRect(x - size/2, y - size/2, size, size)
          }
        } else if (element.type === 'triangle') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const size = 30 + random(60)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.7
            drawTriangle(ctx, x, y, size)
            ctx.fill()
          }
        } else if (element.type === 'animal' || element.type === 'character') {
          // Draw recognizable animal/character representation
          const x = 200
          const y = 200
          const size = 120
          ctx.save()
          ctx.translate(x, y)
          
          if (element.keyword === 'cat') {
            // Draw a recognizable cat
            ctx.fillStyle = colors[0] || '#FF6B6B'
            ctx.globalAlpha = 0.9
            
            // Cat body (oval)
            ctx.beginPath()
            ctx.ellipse(0, 20, size/3, size/2.5, 0, 0, Math.PI * 2)
            ctx.fill()
            
            // Cat head (circle)
            ctx.beginPath()
            ctx.arc(0, -size/4, size/3, 0, Math.PI * 2)
            ctx.fill()
            
            // Cat ears (triangles)
            ctx.fillStyle = colors[0] || '#FF6B6B'
            ctx.beginPath()
            ctx.moveTo(-size/4, -size/2)
            ctx.lineTo(-size/6, -size/1.5)
            ctx.lineTo(-size/8, -size/2.5)
            ctx.closePath()
            ctx.fill()
            
            ctx.beginPath()
            ctx.moveTo(size/4, -size/2)
            ctx.lineTo(size/6, -size/1.5)
            ctx.lineTo(size/8, -size/2.5)
            ctx.closePath()
            ctx.fill()
            
            // Inner ear (pink)
            ctx.fillStyle = '#FFB6C1'
            ctx.beginPath()
            ctx.moveTo(-size/5, -size/2.2)
            ctx.lineTo(-size/7, -size/1.8)
            ctx.lineTo(-size/9, -size/2.4)
            ctx.closePath()
            ctx.fill()
            
            ctx.beginPath()
            ctx.moveTo(size/5, -size/2.2)
            ctx.lineTo(size/7, -size/1.8)
            ctx.lineTo(size/9, -size/2.4)
            ctx.closePath()
            ctx.fill()
            
            // Eyes
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(-size/6, -size/3, size/8, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/6, -size/3, size/8, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(-size/6, -size/3, size/12, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/6, -size/3, size/12, 0, Math.PI * 2)
            ctx.fill()
            
            // Nose (triangle)
            ctx.fillStyle = '#FFB6C1'
            ctx.beginPath()
            ctx.moveTo(0, -size/4)
            ctx.lineTo(-size/16, -size/3.5)
            ctx.lineTo(size/16, -size/3.5)
            ctx.closePath()
            ctx.fill()
            
            // Mouth
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(0, -size/3.5)
            ctx.lineTo(-size/8, -size/3)
            ctx.moveTo(0, -size/3.5)
            ctx.lineTo(size/8, -size/3)
            ctx.stroke()
            
          } else if (element.keyword === 'doraemon' || promptLower.includes('doraemon')) {
            // Draw Doraemon character
            // Blue body/head
            ctx.fillStyle = '#0095D9'
            ctx.globalAlpha = 1
            
            // Head (large circle)
            ctx.beginPath()
            ctx.arc(0, -size/6, size/2.2, 0, Math.PI * 2)
            ctx.fill()
            
            // White face
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.ellipse(0, -size/8, size/3, size/2.5, 0, 0, Math.PI * 2)
            ctx.fill()
            
            // Eyes
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(-size/4, -size/4, size/5, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/4, -size/4, size/5, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(-size/4, -size/4, size/8, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/4, -size/4, size/8, 0, Math.PI * 2)
            ctx.fill()
            
            // Nose (red circle)
            ctx.fillStyle = '#FF0000'
            ctx.beginPath()
            ctx.arc(0, -size/12, size/20, 0, Math.PI * 2)
            ctx.fill()
            
            // Mouth line
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(0, -size/12)
            ctx.lineTo(0, size/8)
            ctx.stroke()
            
            // Body
            ctx.fillStyle = '#0095D9'
            ctx.beginPath()
            ctx.ellipse(0, size/3, size/2.5, size/1.8, 0, 0, Math.PI * 2)
            ctx.fill()
            
            // White chest/belly
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.ellipse(0, size/3, size/3.5, size/2.2, 0, 0, Math.PI * 2)
            ctx.fill()
            
            // Bell (yellow circle with line)
            ctx.fillStyle = '#FFD700'
            ctx.beginPath()
            ctx.arc(0, size/4, size/12, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 1
            ctx.stroke()
            
            // Bell line
            ctx.strokeStyle = '#000000'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(0, size/4 - size/12)
            ctx.lineTo(0, size/4 + size/12)
            ctx.stroke()
            
          } else if (element.keyword === 'dog') {
            // Draw a dog
            ctx.fillStyle = colors[0] || '#8B4513'
            ctx.globalAlpha = 0.9
            
            // Dog body
            ctx.beginPath()
            ctx.ellipse(0, 30, size/3, size/2, 0, 0, Math.PI * 2)
            ctx.fill()
            
            // Dog head
            ctx.beginPath()
            ctx.arc(0, -size/3, size/3, 0, Math.PI * 2)
            ctx.fill()
            
            // Dog ears (floppy)
            ctx.beginPath()
            ctx.ellipse(-size/3, -size/2.5, size/5, size/3, -0.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.ellipse(size/3, -size/2.5, size/5, size/3, 0.5, 0, Math.PI * 2)
            ctx.fill()
            
            // Eyes
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(-size/5, -size/2.5, size/10, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/5, -size/2.5, size/10, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(-size/5, -size/2.5, size/16, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/5, -size/2.5, size/16, 0, Math.PI * 2)
            ctx.fill()
            
            // Nose
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(0, -size/2.2, size/20, 0, Math.PI * 2)
            ctx.fill()
            
          } else {
            // Generic animal shape with more detail
            ctx.fillStyle = colors[0] || '#4ECDC4'
            ctx.globalAlpha = 0.9
            
            // Body
            ctx.beginPath()
            ctx.ellipse(0, 20, size/3, size/2.5, 0, 0, Math.PI * 2)
            ctx.fill()
            
            // Head
            ctx.beginPath()
            ctx.arc(0, -size/4, size/3, 0, Math.PI * 2)
            ctx.fill()
            
            // Simple eyes
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(-size/6, -size/3, size/12, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/6, -size/3, size/12, 0, Math.PI * 2)
            ctx.fill()
            
            ctx.fillStyle = '#000000'
            ctx.beginPath()
            ctx.arc(-size/6, -size/3, size/20, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(size/6, -size/3, size/20, 0, Math.PI * 2)
            ctx.fill()
          }
          
          ctx.restore()
        } else if (element.type === 'abstract') {
          for (let i = 0; i < element.count; i++) {
            const x = 50 + random(300)
            const y = 50 + random(300)
            const size = 15 + random(50)
            ctx.fillStyle = colors[Math.floor(random(colors.length))]
            ctx.globalAlpha = 0.6
            
            if (element.shape === 'circles' || element.shape === 'mixed') {
              ctx.beginPath()
              ctx.arc(x, y, size, 0, Math.PI * 2)
              ctx.fill()
            }
            if (element.shape === 'squares' || element.shape === 'mixed') {
              ctx.fillRect(x - size/2, y - size/2, size, size)
            }
            if (element.shape === 'lines' || element.shape === 'mixed') {
              ctx.strokeStyle = colors[Math.floor(random(colors.length))]
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.moveTo(x - size, y - size)
              ctx.lineTo(x + size, y + size)
              ctx.stroke()
            }
          }
        }
      })
      
      ctx.restore()
      
      // Add text overlay with prompt (only first 25 chars)
      ctx.globalAlpha = 1
      ctx.fillStyle = '#FFFFFF'
      ctx.font = `bold ${18 + Math.floor(random(4))}px Arial`
      ctx.textAlign = 'center'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 3
      ctx.strokeText(promptText.slice(0, 25), 200, 350)
      ctx.fillText(promptText.slice(0, 25), 200, 350)
      
      // Add style label
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = '12px Arial'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.strokeText(`${style} • ${colorScheme}`, 200, 380)
      ctx.fillText(`${style} • ${colorScheme}`, 200, 380)
      
      resolve(canvas.toDataURL('image/png'))
    })
  }
  
  const drawHeart = (ctx, x, y, size) => {
    ctx.beginPath()
    ctx.moveTo(x, y + size/4)
    ctx.bezierCurveTo(x, y, x - size/2, y, x - size/2, y + size/4)
    ctx.bezierCurveTo(x - size/2, y + size/2, x, y + size * 0.75, x, y + size)
    ctx.bezierCurveTo(x, y + size * 0.75, x + size/2, y + size/2, x + size/2, y + size/4)
    ctx.bezierCurveTo(x + size/2, y, x, y, x, y + size/4)
    ctx.closePath()
  }
  
  const drawFlower = (ctx, x, y, size) => {
    const petals = 6
    for (let i = 0; i < petals; i++) {
      const angle = (Math.PI * 2 / petals) * i
      const petalX = x + Math.cos(angle) * size/3
      const petalY = y + Math.sin(angle) * size/3
      ctx.beginPath()
      ctx.arc(petalX, petalY, size/4, 0, Math.PI * 2)
      ctx.fill()
    }
    // Center
    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(x, y, size/6, 0, Math.PI * 2)
    ctx.fill()
  }
  
  const drawTriangle = (ctx, x, y, size) => {
    ctx.beginPath()
    ctx.moveTo(x, y - size/2)
    ctx.lineTo(x - size/2, y + size/2)
    ctx.lineTo(x + size/2, y + size/2)
    ctx.closePath()
  }
  
  const drawStar = (ctx, x, y, spikes, outerRadius, innerRadius) => {
    let rot = Math.PI / 2 * 3
    let x_val = x
    let y_val = y
    const step = Math.PI / spikes
    
    ctx.beginPath()
    ctx.moveTo(x, y - outerRadius)
    for (let i = 0; i < spikes; i++) {
      x_val = x + Math.cos(rot) * outerRadius
      y_val = y + Math.sin(rot) * outerRadius
      ctx.lineTo(x_val, y_val)
      rot += step
      
      x_val = x + Math.cos(rot) * innerRadius
      y_val = y + Math.sin(rot) * innerRadius
      ctx.lineTo(x_val, y_val)
      rot += step
    }
    ctx.lineTo(x, y - outerRadius)
    ctx.closePath()
  }

  // Generate sticker using AI API or demo mode
  const generateSticker = async () => {
    // Clear any previous validation errors
    setValidationError(null)
    
    if (!prompt.trim()) {
      setValidationError('Please enter a description for your sticker')
      return
    }

    // Validate the prompt for appropriateness
    const validation = validatePromptForSticker(prompt)
    
    if (!validation.isValid) {
      setValidationError(validation.reason)
      return
    }

    setIsGenerating(true)
    
    try {
      // Use sanitized prompt for generation
      const sanitizedPrompt = validation.sanitizedPrompt
      
      // Try to generate using AI API (or fallback to demo)
      const generatedImageData = await generateAIImage(
        sanitizedPrompt, 
        aiStyle, 
        colorScheme,
        generateStickerImage // Pass the canvas function as fallback
      )
      
      const newGeneration = {
        id: Date.now(),
        prompt: sanitizedPrompt,
        image: generatedImageData,
        style: aiStyle,
        colorScheme,
        timestamp: new Date()
      }
      
      setGeneratedImage(generatedImageData)
      setGenerationHistory(prev => [newGeneration, ...prev])
    } catch (error) {
      console.error('Error generating sticker:', error)
      const errorMessage = error.message || 'Error generating sticker. Please try again.'
      setValidationError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateSticker = () => {
    if (prompt.trim()) {
      generateSticker()
    }
  }

  const handleAddToCart = () => {
    if (!generatedImage) {
      alert('Please generate a sticker first')
      return
    }

    const stickerItem = {
      id: `ai-${Date.now()}`,
      name: `AI Generated Sticker - "${prompt.slice(0, 30)}"`,
      category: 'AI Generated Sticker',
      price: parseFloat(totalPrice),
      quantity: 1,
      image: generatedImage,
      specifications: {
        size: stickerSize,
        shape: stickerShape,
        quantity,
        finish,
        prompt,
        style: aiStyle,
        colorScheme
      }
    }

    addToCart(stickerItem)
    navigate('/')
  }

  const loadHistoryItem = (item) => {
    setGeneratedImage(item.image)
    setPrompt(item.prompt)
    setAiStyle(item.style)
    setColorScheme(item.colorScheme)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/createstickers')}
            className="text-purple-600 hover:text-purple-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Back to Create Stickers
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <AutoAwesomeIcon />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              AI Generate Stickers
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Describe your vision and let AI create stunning stickers for you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - AI Generation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Describe Your Sticker</h2>
              
              <div className="space-y-4">
                <div>
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value)
                      // Clear validation error when user starts typing
                      if (validationError) {
                        setValidationError(null)
                      }
                    }}
                    placeholder="Example: A cute cartoon cat wearing sunglasses, vibrant colors, minimalist style..."
                    className={`w-full h-32 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                      validationError 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-purple-500 focus:border-transparent'
                    }`}
                  />
                  {validationError ? (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <WarningIcon className="text-red-600 mt-0.5" fontSize="small" />
                        <p className="text-sm text-red-700">{validationError}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-2">
                      Be as descriptive as possible for best results. Keep content family-friendly.
                    </p>
                  )}
                </div>

                {/* AI Style Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Art Style
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {aiStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setAiStyle(style.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          aiStyle === style.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{style.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{style.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Color Scheme
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme}
                        onClick={() => setColorScheme(scheme)}
                        className={`p-3 rounded-lg border-2 capitalize transition-all ${
                          colorScheme === scheme
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {scheme}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateSticker}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <GenerateIcon />
                      Generate Sticker
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Image Preview */}
            {generatedImage && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Generated Sticker</h2>
                  <button
                    onClick={regenerateSticker}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshIcon fontSize="small" />
                    Regenerate
                  </button>
                </div>
                
                <div className="relative bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
                  <img
                    src={generatedImage}
                    alt="Generated sticker"
                    className={`max-w-full max-h-[300px] object-contain rounded-lg shadow-lg ${
                      stickerShape === 'circle' ? 'rounded-full' : 
                      stickerShape === 'rounded' ? 'rounded-2xl' : 
                      stickerShape === 'rectangle' ? 'rounded-md' : ''
                    }`}
                  />
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Demo Mode</p>
                      <p className="text-sm text-blue-700">
                        Using canvas-based generation to create stickers based on your description.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generation History */}
            {generationHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Generation History</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generationHistory.slice(0, 8).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => loadHistoryItem(item)}
                      className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-purple-500 transition-all"
                    >
                      <img
                        src={item.image}
                        alt={item.prompt}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-xs text-white truncate">{item.prompt.slice(0, 20)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Options */}
            {generatedImage && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize Your Sticker</h2>
                
                {/* Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sticker Size
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setStickerSize(size.value)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          stickerSize === size.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{size.label}</div>
                        <div className="text-sm text-gray-600">{formatPrice(size.price)} each</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Sticker Shape
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {shapes.map((shape) => (
                      <button
                        key={shape}
                        onClick={() => setStickerShape(shape)}
                        className={`p-4 rounded-lg border-2 capitalize transition-all ${
                          stickerShape === shape
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Quantity: {quantity} stickers
                  </label>
                  <input
                    type="range"
                    min="25"
                    max="500"
                    step="25"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>25</span>
                    <span>500</span>
                  </div>
                </div>

                {/* Finish Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Finish Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {finishes.map((finishOption) => (
                      <button
                        key={finishOption}
                        onClick={() => setFinish(finishOption)}
                        className={`p-4 rounded-lg border-2 capitalize transition-all ${
                          finish === finishOption
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        {finishOption}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {generatedImage ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>AI Generation:</span>
                      <span className="font-semibold">{formatPrice(aiGenerationFee)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Size:</span>
                      <span className="font-semibold">{selectedSize?.label}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shape:</span>
                      <span className="font-semibold capitalize">{stickerShape}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Quantity:</span>
                      <span className="font-semibold">{quantity}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Finish:</span>
                      <span className="font-semibold capitalize">{finish}</span>
                    </div>
                    {quantityDiscount < 1 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircleIcon fontSize="small" />
                          <span className="text-sm font-semibold">
                            {((1 - quantityDiscount) * 100).toFixed(0)}% Quantity Discount Applied!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-purple-600">{formatPrice(parseFloat(totalPrice))}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatPrice((parseFloat(totalPrice) - aiGenerationFee) / quantity)} per sticker
                    </p>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <AddShoppingCartIcon />
                    Add to Cart
                  </button>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p>Generate a sticker to see pricing</p>
                </div>
              )}
            </div>

            {/* AI Tips Section */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mt-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AutoAwesomeIcon className="text-blue-600" />
                AI Generation Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li>• Be specific about what you want</li>
                <li>• Include colors, style, and mood</li>
                <li>• Mention any text or symbols needed</li>
                <li>• Use adjectives to describe the look</li>
                <li>• You can regenerate for variations</li>
              </ul>
              
              {/* Safety Notice */}
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <div className="flex items-start gap-2">
                  <WarningIcon className="text-yellow-600 mt-0.5" fontSize="small" />
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1 text-yellow-800">Content Safety</p>
                    <p className="mb-1">All prompts are automatically filtered to ensure family-friendly sticker generation. Inappropriate content is blocked to maintain a safe environment for all users.</p>
                  </div>
                </div>
              </div>
              
              {/* Demo Mode Info */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-start gap-2">
                  <InfoIcon className="text-blue-600 mt-0.5" fontSize="small" />
                  <div className="text-xs text-gray-600">
                    <p className="font-semibold mb-1">Demo Mode</p>
                    <p className="text-gray-600 mb-2">Using canvas-based generation. No API keys needed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIStickerGenerator

