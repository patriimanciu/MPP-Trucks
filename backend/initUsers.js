import { query } from './db.js';
import bcrypt from 'bcrypt';

async function initDatabase() {
  try {
    console.log('Dropping existing tables...');
    await query('DROP TABLE IF EXISTS activity_logs CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      )
    `);
    console.log('Users table created or already exists');
    
    // Create activity logs table
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(50),
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Activity logs table created or already exists');
    
    // Create indexes for better query performance
    await query('CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action)');
    await query('CREATE INDEX IF NOT EXISTS idx_logs_entity_type ON activity_logs(entity_type)');
    
    // Check if admin exists
    const adminCheck = await query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
    
    // Create admin user if doesn't exist
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword', salt);
      
      await query(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
        ['admin@example.com', hashedPassword, 'Admin', 'User', 'admin']
      );
      console.log('Admin user created');
    }
    
    // Create regular user if doesn't exist
    const userCheck = await query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
    if (userCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await query(
        'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5)',
        ['user@example.com', hashedPassword, 'Regular', 'User', 'user']
      );
      console.log('Regular user created');
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initDatabase().then(() => process.exit(0));
}

export default initDatabase;