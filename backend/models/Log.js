import { query } from '../db.js';

class Log {
  static async createTable() {
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
    await query('CREATE INDEX IF NOT EXISTS idx_logs_user_id ON activity_logs(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_logs_action ON activity_logs(action)');
    await query('CREATE INDEX IF NOT EXISTS idx_logs_entity_type ON activity_logs(entity_type)');
  }
  
  static async createLog(userId, action, entityType, entityId, details = {}) {
    const result = await query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, action, entityType, entityId, JSON.stringify(details)]
    );
    
    return result.rows[0];
  }
  
  static async getUserLogs(userId, limit = 100) {
    const result = await query(
      'SELECT * FROM activity_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    
    return result.rows;
  }
  
  static async getAllLogs(limit = 100, offset = 0) {
    const result = await query(
      `SELECT l.*, u.email as user_email 
       FROM activity_logs l
       JOIN users u ON l.user_id = u.id
       ORDER BY l.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    return result.rows;
  }
}

export default Log;
export const {createLog, getAllLogs, getUserLogs} = Log;