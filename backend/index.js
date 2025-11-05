import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import templateRoutes from './routes/templates.js'
import customStickerRoutes from './routes/customStickers.js'
import './config/db.js' // Initialize database connection

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/custom-stickers', customStickerRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// 404 handler for API routes (must be after all routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Auth endpoints:`)
  console.log(`   POST /api/auth/signup`)
  console.log(`   POST /api/auth/login`)
  console.log(`   GET  /api/auth/verify`)
  console.log(`📝 Template endpoints:`)
  console.log(`   GET  /api/templates`)
  console.log(`   GET  /api/templates/search?q=query`)
  console.log(`   GET  /api/templates?category=id`)
  console.log(`   GET  /api/templates?trending=true`)
  console.log(`   GET  /api/templates/:id`)
  console.log(`   GET  /api/templates/:identifier/stickers`)
  console.log(`   GET  /api/templates/categories`)
  console.log(`📝 Custom Sticker endpoints:`)
  console.log(`   POST /api/custom-stickers`)
  console.log(`   GET  /api/custom-stickers/published`)
  console.log(`   GET  /api/custom-stickers/my-stickers/:userId`)
  console.log(`   PATCH /api/custom-stickers/:id/publish`)
  console.log(`   DELETE /api/custom-stickers/:id?user_id=userId`)
})

