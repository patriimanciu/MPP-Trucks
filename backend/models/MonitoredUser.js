import { query } from '../db.js';

class MonitoredUser {
  static async createTable() {
    await query(`
      CREATE TABLE IF NOT EXISTS monitored_users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        reason VARCHAR(255) NOT NULL,
        detection_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        activity_count INTEGER NOT NULL,
        time_window VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        notes TEXT
      )
    `);
    
    console.log('Monitored users table created or already exists');
    await query('CREATE INDEX IF NOT EXISTS idx_monitored_user_id ON monitored_users(user_id)');
  }
  
  static async addMonitoredUser(userId, reason, activityCount, timeWindow) {
    const result = await query(
      `INSERT INTO monitored_users 
        (user_id, reason, activity_count, time_window) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userId, reason, activityCount, timeWindow]
    );
    
    return result.rows[0];
  }
  
  static async getMonitoredUsers() {
    const result = await query(`
      SELECT m.*, 
             u.email as user_email, 
             u.first_name, 
             u.last_name, 
             ru.email as reviewer_email
      FROM monitored_users m
      JOIN users u ON m.user_id = u.id
      LEFT JOIN users ru ON m.reviewed_by = ru.id
      ORDER BY m.detection_time DESC
    `);
    
    return result.rows;
  }
  
  static async updateStatus(id, status, reviewedBy, notes) {
    const result = await query(
      `UPDATE monitored_users 
       SET status = $1, 
           reviewed_by = $2, 
           reviewed_at = CURRENT_TIMESTAMP, 
           notes = $3
       WHERE id = $4
       RETURNING *`,
      [status, reviewedBy, notes, id]
    );
    
    return result.rows[0];
  }
}

export default MonitoredUser;
export const { addMonitoredUser, getMonitoredUsers, updateStatus } = MonitoredUser;