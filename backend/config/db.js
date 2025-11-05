import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stickersdb',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
})

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message)
  // Don't exit - let the app continue and show errors
})

// Create users table if it doesn't exist
const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `
  
  try {
    // Test connection first
    await pool.query('SELECT NOW()')
    console.log('✅ Database connection successful')
    
    // Create table
    await pool.query(query)
    console.log('✅ Users table ready')
  } catch (error) {
    console.error('❌ Database error:', error.message)
    console.error('💡 Make sure:')
    console.error('   1. PostgreSQL is installed and running')
    console.error('   2. Database "stickersdb" exists')
    console.error('   3. .env file has correct DB credentials')
    console.error('   4. User has permission to create tables')
  }
}

// Initialize database
createUsersTable()

export default pool

