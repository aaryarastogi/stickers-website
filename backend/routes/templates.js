import express from 'express'
import pool from '../config/db.js'

const router = express.Router()

// Get all categories (must come before parameterized routes)
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name FROM categories ORDER BY name ASC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Categories error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: error.message 
    })
  }
})

// Search stickers and templates (must come before parameterized routes)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.trim().length === 0) {
      return res.json({ stickers: [], templates: [] })
    }
    
    const searchTerm = `%${q.toLowerCase()}%`
    
    // Search stickers
    const stickersQuery = `
      SELECT 
        s.id,
        s.name,
        s.image_url,
        s.price,
        s.finishes,
        s.template_id,
        t.title as template_title
      FROM stickers s
      JOIN templates t ON s.template_id = t.id
      WHERE LOWER(s.name) LIKE $1
      ORDER BY s.created_at DESC
      LIMIT 10
    `
    
    // Search templates
    const templatesQuery = `
      SELECT 
        t.id,
        t.title,
        t.image_url,
        t.is_trending,
        c.name as category_name
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE LOWER(t.title) LIKE $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `
    
    const [stickersResult, templatesResult] = await Promise.all([
      pool.query(stickersQuery, [searchTerm]),
      pool.query(templatesQuery, [searchTerm])
    ])
    
    res.json({
      stickers: stickersResult.rows,
      templates: templatesResult.rows
    })
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ 
      error: 'Failed to search',
      message: error.message 
    })
  }
})

// Get all templates (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category, trending } = req.query
    
    let query = `
      SELECT 
        t.id,
        t.title,
        t.image_url,
        t.is_trending,
        c.name as category_name,
        c.id as category_id
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE 1=1
    `
    const params = []
    
    if (category) {
      query += ` AND c.id = $${params.length + 1}`
      params.push(category)
    }
    
    if (trending === 'true') {
      query += ` AND t.is_trending = true`
    }
    
    query += ` ORDER BY t.created_at DESC`
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Templates error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch templates',
      message: error.message 
    })
  }
})

// Get stickers by template ID or title (must come before /:id route)
router.get('/:identifier/stickers', async (req, res) => {
  try {
    const { identifier } = req.params
    
    // Check if identifier is a number (ID) or string (title)
    const isNumeric = !isNaN(identifier)
    
    let query
    let params
    
    if (isNumeric) {
      // Search by template ID
      query = `
        SELECT 
          s.id,
          s.template_id,
          s.name,
          s.image_url,
          s.colors,
          s.finishes,
          s.price,
          t.title as template_title
        FROM stickers s
        JOIN templates t ON s.template_id = t.id
        WHERE s.template_id = $1
        ORDER BY s.created_at ASC
      `
      params = [identifier]
    } else {
      // Search by template title
      query = `
        SELECT 
          s.id,
          s.template_id,
          s.name,
          s.image_url,
          s.colors,
          s.finishes,
          s.price,
          t.title as template_title
        FROM stickers s
        JOIN templates t ON s.template_id = t.id
        WHERE LOWER(t.title) = LOWER($1)
        ORDER BY s.created_at ASC
      `
      params = [identifier]
    }
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Stickers error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch stickers',
      message: error.message 
    })
  }
})

// Get single template by ID (must come after /stickers route)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await pool.query(
      `SELECT 
        t.id,
        t.title,
        t.image_url,
        t.is_trending,
        c.name as category_name,
        c.id as category_id
      FROM templates t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1`,
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('Template error:', error)
    res.status(500).json({ 
      error: 'Failed to fetch template',
      message: error.message 
    })
  }
})

export default router

