// AI Image Generation Service - Demo Mode Only
// Canvas-based generation for stickers

/**
 * Generate image using local canvas-based demo
 */
const generateWithDemo = async (prompt, style, colorScheme, generateStickerImage) => {
  // Use the existing canvas generation function
  return await generateStickerImage(prompt, style, colorScheme)
}

/**
 * Main function to generate AI image (demo mode only)
 */
export const generateAIImage = async (prompt, style, colorScheme, generateStickerImage) => {
  console.log('✅ Using demo mode - canvas-based generation')
  return await generateWithDemo(prompt, style, colorScheme, generateStickerImage)
}

/**
 * Get available providers (demo mode only)
 */
export const getAIProviders = () => {
  return {
    demo: {
      name: 'Demo Mode',
      configured: true,
      quality: 'Basic',
      description: 'Canvas-based generation - No API key needed'
    }
  }
}

export default generateAIImage
