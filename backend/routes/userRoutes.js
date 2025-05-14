import express from 'express';
import User from '../models/User.js';
import * as Log from '../models/Log.js';
import { auth, authorize } from '../auth.js';
import { query } from '../db.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const user = await User.register(req.body);
    
    // Don't return the password
    delete user.password;
    
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await User.login(email, password);
    res.json(authData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Get user activity logs
router.get('/logs', auth, async (req, res) => {
  try {
    const logs = await Log.getUserLogs(req.userId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
// Get all users (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const result = await query('SELECT id, email, first_name, last_name, role FROM users');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all activity logs (admin only)
router.get('/all-logs', auth, authorize('admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const logs = await Log.getAllLogs(limit, offset);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;