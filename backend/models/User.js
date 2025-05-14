import bcrypt from 'bcrypt';
import { query } from '../db.js';
import jwt from 'jsonwebtoken';

class User {
  static async createTable() {
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
  }
  
  static async register(userData) {
    const { email, password, first_name, last_name } = userData;
    
    // Check if user exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const result = await query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, hashedPassword, first_name, last_name, 'user']
    );
    
    return result.rows[0];
  }
  
  static async login(email, password) {
    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    
    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login time
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' }
    );
    
    return { 
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    };
  }
  
  static async getById(id) {
    const result = await query('SELECT id, email, first_name, last_name, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

// Export the class as default
export default User;

// Export individual methods for direct access
export const { createTable, register, login, getById } = User;