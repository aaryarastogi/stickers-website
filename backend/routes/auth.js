import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

const router = express.Router()

// JWT secret (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'All fields are required' 
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Passwords do not match' 
      })
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      })
    }

    // Check if user already exists
    const checkUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (checkUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email.toLowerCase(), hashedPassword]
    )

    const user = result.rows[0]

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    
    // Provide more specific error messages
    if (error.message.includes('does not exist') || error.message.includes('role')) {
      return res.status(500).json({ 
        error: 'Database connection error',
        message: 'PostgreSQL user or database not found. Please check your .env file and database setup.'
      })
    }
    
    if (error.message.includes('password authentication failed')) {
      return res.status(500).json({ 
        error: 'Database authentication failed',
        message: 'Incorrect PostgreSQL password. Please check your .env file.'
      })
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      return res.status(500).json({ 
        error: 'Database connection refused',
        message: 'PostgreSQL server is not running or connection details are incorrect.'
      })
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      })
    }

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    const user = result.rows[0]

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    })
  }
})

// Verify token endpoint (for protected routes)
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided' 
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)

    // Get user from database
    const result = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [decoded.userId]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'User not found' 
      })
    }

    res.json({
      user: result.rows[0]
    })
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid or expired token' 
    })
  }
})

export default router

