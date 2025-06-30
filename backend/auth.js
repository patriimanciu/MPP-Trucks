import jwt from 'jsonwebtoken';
import { getById } from './models/User.js';

// Replace with your actual secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export async function auth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const user = await getById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Attach user to request object
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

export function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Access forbidden' });
    }
    
    next();
  };
}