import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

// Middleware to verify JWT token (simplified - you can use jwt.verify if needed)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token']
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // For now, we'll get user from localStorage on frontend
    // In production, verify JWT here
    // For this implementation, we'll get user_id from request body or query
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Create a custom sticker
router.post('/', async (req, res) => {
  try {
    const { user_id, name, category, image_url, specifications, price, is_published } = req.body

    if (!user_id || !name || !category || !image_url) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, name, category, image_url' 
      })
    }

    const result = await pool.query(
      `INSERT INTO user_created_stickers 
       (user_id, name, category, image_url, specifications, price, is_published) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [
        user_id,
        name,
        category,
        image_url,
        JSON.stringify(specifications || {}),
        price || 0.00,
        is_published || false
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create custom sticker error:', error)
    res.status(500).json({ 
      error: 'Failed to create sticker',
      message: error.message 
    })
  }
})

// Get all published stickers (for public viewing)
router.get('/published', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ucs.id,
        ucs.name,
        ucs.category,
        ucs.image_url,
        ucs.specifications,
        ucs.price,
        ucs.created_at,
        u.name as creator_name
       FROM user_created_stickers ucs
       JOIN users u ON ucs.user_id = u.id
       WHERE ucs.is_published = true
       ORDER BY ucs.created_at DESC`
    )

    // Parse JSONB specifications
    const stickers = result.rows.map(row => ({
      ...row,
      specifications: typeof row.specifications === 'string' 
        ? JSON.parse(row.specifications) 
        : row.specifications
    }))

    res.json(stickers)
  } catch (error) {
    console.error('Get published stickers error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch published stickers',
      message: error.message 
    })
  }
})

// Get user's own stickers (both published and unpublished)
router.get('/my-stickers/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const result = await pool.query(
      `SELECT 
        id,
        name,
        category,
        image_url,
        specifications,
        price,
        is_published,
        created_at
       FROM user_created_stickers
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

    // Parse JSONB specifications
    const stickers = result.rows.map(row => ({
      ...row,
      specifications: typeof row.specifications === 'string' 
        ? JSON.parse(row.specifications) 
        : row.specifications
    }))

    res.json(stickers)
  } catch (error) {
    console.error('Get my stickers error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch stickers',
      message: error.message 
    })
  }
})

// Delete a custom sticker (must be before /:id/publish to avoid route conflicts)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { user_id } = req.query

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required as query parameter' })
    }

    // Verify ownership
    const ownershipCheck = await pool.query(
      'SELECT user_id FROM user_created_stickers WHERE id = $1',
      [id]
    )

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' })
    }

    if (ownershipCheck.rows[0].user_id !== parseInt(user_id)) {
      return res.status(403).json({ error: 'Not authorized to delete this sticker' })
    }

    // Delete the sticker
    await pool.query(
      'DELETE FROM user_created_stickers WHERE id = $1',
      [id]
    )

    res.json({ message: 'Sticker deleted successfully' })
  } catch (error) {
    console.error('Delete sticker error:', error)
    res.status(500).json({ 
      error: 'Failed to delete sticker',
      message: error.message 
    })
  }
})

// Update publish status
router.patch('/:id/publish', async (req, res) => {
  try {
    const { id } = req.params
    const { user_id, is_published } = req.body

    if (user_id === undefined) {
      return res.status(400).json({ error: 'user_id is required' })
    }

    // Verify ownership
    const ownershipCheck = await pool.query(
      'SELECT user_id FROM user_created_stickers WHERE id = $1',
      [id]
    )

    if (ownershipCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Sticker not found' })
    }

    if (ownershipCheck.rows[0].user_id !== user_id) {
      return res.status(403).json({ error: 'Not authorized to update this sticker' })
    }

    const result = await pool.query(
      `UPDATE user_created_stickers 
       SET is_published = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [is_published, id]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update publish status error:', error)
    res.status(500).json({ 
      error: 'Failed to update publish status',
      message: error.message 
    })
  }
})

export default router

