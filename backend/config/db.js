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

// Create categories table
const createCategoriesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
  `
  
  try {
    await pool.query(query)
    console.log('✅ Categories table ready')
  } catch (error) {
    console.error('❌ Categories table error:', error.message)
  }
}

// Create templates table
const createTemplatesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      image_url TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      is_trending BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category_id);
    CREATE INDEX IF NOT EXISTS idx_templates_trending ON templates(is_trending);
  `
  
  try {
    await pool.query(query)
    console.log('✅ Templates table ready')
  } catch (error) {
    console.error('❌ Templates table error:', error.message)
  }
}

// Create stickers table
const createStickersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS stickers (
      id SERIAL PRIMARY KEY,
      template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      image_url TEXT NOT NULL,
      colors TEXT[] DEFAULT '{}',
      price DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_stickers_template ON stickers(template_id);
  `
  
  try {
    await pool.query(query)
    console.log('✅ Stickers table ready')
    
    // Add finishes column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE stickers 
        ADD COLUMN IF NOT EXISTS finishes TEXT[] DEFAULT '{}'
      `)
      console.log('✅ Finishes column added/verified')
    } catch (alterError) {
      // Column might already exist, ignore error
      if (!alterError.message.includes('already exists')) {
        console.error('⚠️ Finishes column check:', alterError.message)
      }
    }
  } catch (error) {
    console.error('❌ Stickers table error:', error.message)
  }
}

// Create user_created_stickers table
const createUserCreatedStickersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS user_created_stickers (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      image_url TEXT NOT NULL,
      specifications JSONB DEFAULT '{}',
      price DECIMAL(10, 2) DEFAULT 0.00,
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_stickers_user ON user_created_stickers(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_stickers_published ON user_created_stickers(is_published);
  `
  
  try {
    await pool.query(query)
    console.log('✅ User created stickers table ready')
  } catch (error) {
    console.error('❌ User created stickers table error:', error.message)
  }
}

// Initialize database
const initializeDatabase = async () => {
  await createUsersTable()
  await createCategoriesTable()
  await createTemplatesTable()
  await createStickersTable()
  await createUserCreatedStickersTable()
  
  // Seed initial data if tables are empty
  try {
    const templateCount = await pool.query('SELECT COUNT(*) FROM templates')
    if (parseInt(templateCount.rows[0].count) === 0) {
      console.log('📦 Seeding initial template data...')
      await seedInitialData()
    }
    
    const stickerCount = await pool.query('SELECT COUNT(*) FROM stickers')
    if (parseInt(stickerCount.rows[0].count) === 0) {
      console.log('📦 Seeding initial sticker data...')
      await seedStickerData()
    } else {
      // Update existing stickers with finishes if they don't have any
      try {
        const finishTypes = ['matte', 'glossy', 'metal']
        const existingStickers = await pool.query('SELECT id, finishes FROM stickers WHERE finishes IS NULL OR finishes = \'{}\'')
        
        if (existingStickers.rows.length > 0) {
          console.log(`📦 Adding finishes to ${existingStickers.rows.length} existing stickers...`)
          for (const sticker of existingStickers.rows) {
            // Randomly assign finishes to some stickers (60% chance)
            let finishes = []
            if (Math.random() < 0.6) {
              const numFinishes = 1 + Math.floor(Math.random() * 3)
              const shuffledFinishes = [...finishTypes].sort(() => Math.random() - 0.5)
              finishes = shuffledFinishes.slice(0, numFinishes)
            }
            
            await pool.query(
              'UPDATE stickers SET finishes = $1 WHERE id = $2',
              [finishes, sticker.id]
            )
          }
          console.log('✅ Existing stickers updated with finishes')
        }
      } catch (updateError) {
        console.error('⚠️ Error updating existing stickers:', updateError.message)
      }
    }
  } catch (error) {
    console.error('Seed check error:', error.message)
  }
}

// Seed initial data
const seedInitialData = async () => {
  try {
    // Insert categories
    const categories = [
      'Oval', 'Circle Sticker', 'Illustration', 'Waxing', 'Splatter',
      'Smile', 'Santa Claus', 'Spelling', 'Mickey Mouse Template', 'Funny',
      'Paint', 'Volunteer', 'Unicorn', 'Safety', 'Personalized', 
      'Christmas', 'Valentine', 'Sport'
    ]

    const categoryMap = {}
    
    for (const catName of categories) {
      const result = await pool.query(
        'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id, name',
        [catName]
      )
      if (result.rows.length > 0) {
        categoryMap[catName] = result.rows[0].id
      } else {
        const existing = await pool.query('SELECT id FROM categories WHERE name = $1', [catName])
        if (existing.rows.length > 0) {
          categoryMap[catName] = existing.rows[0].id
        }
      }
    }

    // Insert templates
    const templates = [
      {
        title: 'Safety Sticker',
        image_url: 'https://template.canva.com/EAEVzH0z3xs/2/0/400w-DkzNIfSkjOg.jpg',
        category: 'Safety',
        trending: true
      },
      {
        title: 'Personalized Sticker',
        image_url: 'https://template.canva.com/EAEVzPoOheA/5/0/400w-2fxPudgb_YU.jpg',
        category: 'Personalized',
        trending: true
      },
      {
        title: 'Christmas Sticker',
        image_url: 'https://template.canva.com/EAELAsw9ajc/2/0/400w-_0IlWcZP25s.jpg',
        category: 'Christmas',
        trending: true
      },
      {
        title: "Valentine's Day Sticker",
        image_url: 'https://template.canva.com/EAE1NypPdUc/3/0/400w-HU9xbqWQJf0.jpg',
        category: 'Valentine',
        trending: false
      },
      {
        title: 'Sport Sticker',
        image_url: 'https://template.canva.com/EADzBjUHBoM/1/0/400w-vcb5-2iejVI.jpg',
        category: 'Sport',
        trending: false
      },
      {
        title: 'Funny Sticker',
        image_url: 'https://template.canva.com/EAEVzH0z3xs/2/0/400w-DkzNIfSkjOg.jpg',
        category: 'Funny',
        trending: true
      },
      {
        title: 'Unicorn Sticker',
        image_url: 'https://template.canva.com/EAEVzPoOheA/5/0/400w-2fxPudgb_YU.jpg',
        category: 'Unicorn',
        trending: false
      },
      {
        title: 'Smile Sticker',
        image_url: 'https://template.canva.com/EAELAsw9ajc/2/0/400w-_0IlWcZP25s.jpg',
        category: 'Smile',
        trending: true
      },
      {
        title: 'Circle Sticker',
        image_url: 'https://template.canva.com/EAE1NypPdUc/3/0/400w-HU9xbqWQJf0.jpg',
        category: 'Circle Sticker',
        trending: false
      },
      {
        title: 'Oval Sticker',
        image_url: 'https://template.canva.com/EADzBjUHBoM/1/0/400w-vcb5-2iejVI.jpg',
        category: 'Oval',
        trending: false
      }
    ]

    for (const template of templates) {
      const categoryId = categoryMap[template.category] || null
      await pool.query(
        'INSERT INTO templates (title, image_url, category_id, is_trending) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [template.title, template.image_url, categoryId, template.trending]
      )
    }

    console.log('✅ Initial template data seeded')
  } catch (error) {
    console.error('❌ Seed data error:', error.message)
  }
}

// Seed sticker data
const seedStickerData = async () => {
  try {
    // Get all templates
    const templatesResult = await pool.query('SELECT id, title FROM templates')
    const templates = templatesResult.rows
    
    if (templates.length === 0) {
      console.log('⚠️ No templates found, skipping sticker seeding')
      return
    }
    
    // Create stickers for each template (3-5 stickers per template)
    const finishTypes = ['matte', 'glossy', 'metal']
    const finishColors = {
      matte: '#FFB347',    // Light orange/peach
      glossy: '#20B2AA',    // Teal
      metal: '#FFD700'      // Gold/yellow
    }
    
    for (const template of templates) {
      const stickerCount = 4 + Math.floor(Math.random() * 2) // 4-5 stickers per template
      
      for (let i = 1; i <= stickerCount; i++) {
        const colors = [
          ['#9D3DD9', '#3D9DD9', '#F4D956'],
          ['#FF6B6B', '#4ECDC4', '#FFE66D'],
          ['#95E1D3', '#F38181', '#AA96DA'],
          ['#FFA07A', '#20B2AA', '#FFD700'],
          ['#FF69B4', '#00CED1', '#FFA500'],
          ['#9370DB', '#00FA9A', '#FF1493']
        ]
        
        const colorSet = colors[Math.floor(Math.random() * colors.length)]
        const price = 900 + Math.floor(Math.random() * 200) // 900-1100
        
        // Randomly assign finishes to some stickers (60% chance)
        let finishes = []
        if (Math.random() < 0.6) {
          // Randomly select 1-3 finishes
          const numFinishes = 1 + Math.floor(Math.random() * 3)
          const shuffledFinishes = [...finishTypes].sort(() => Math.random() - 0.5)
          finishes = shuffledFinishes.slice(0, numFinishes)
        }
        
        await pool.query(
          `INSERT INTO stickers (template_id, name, image_url, colors, finishes, price) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            template.id,
            `${template.title} Variant ${i}`,
            `https://template.canva.com/EAEVzH0z3xs/2/0/400w-DkzNIfSkjOg.jpg`, // Using template image as placeholder
            colorSet,
            finishes,
            price
          ]
        )
      }
    }
    
    console.log('✅ Initial sticker data seeded')
  } catch (error) {
    console.error('❌ Sticker seed data error:', error.message)
  }
}

initializeDatabase()

export default pool

