import { query } from './db.js';

// Lower thresholds for easier testing
export const SUSPICIOUS_THRESHOLDS = {
  'create': { count: 3, window: '5 minutes', reason: 'High frequency creation' },
  'update': { count: 5, window: '5 minutes', reason: 'High frequency updates' },
  'delete': { count: 2, window: '5 minutes', reason: 'High frequency deletion' },
  'login': { count: 4, window: '5 minutes', reason: 'Excessive login attempts' }
};

// Run analysis more frequently for testing
const ANALYSIS_INTERVAL_MS = 60 * 1000; // Every 1 minute for testing (5 mins in production)

/**
 * Analyzes logs for suspicious activity patterns
 */
export async function runSecurityAnalysis() {
  console.log('🔍 Starting security analysis...');
  
  try {
    // For each action type, check for users exceeding thresholds
    for (const [action, threshold] of Object.entries(SUSPICIOUS_THRESHOLDS)) {
      // This SQL query finds users who performed too many actions in the given time window
      const suspiciousQuery = `
        SELECT 
          user_id, 
          COUNT(*) as action_count,
          MIN(created_at) as first_action,
          MAX(created_at) as last_action
        FROM activity_logs
        WHERE 
          action = $1 AND
          created_at > NOW() - INTERVAL '${threshold.window}'
        GROUP BY user_id
        HAVING COUNT(*) >= $2
      `;
      
      console.log(`Checking for suspicious ${action} actions (threshold: ${threshold.count})`);
      
      const suspiciousUsers = await query(suspiciousQuery, [action, threshold.count]);
      
      console.log(`Found ${suspiciousUsers.rowCount} suspicious users for ${action}`);
      
      // Process each suspicious user
      for (const user of suspiciousUsers.rows) {
        console.log(`User ${user.user_id} performed ${user.action_count} ${action} actions`);
        
        // Calculate time window in seconds
        const firstAction = new Date(user.first_action);
        const lastAction = new Date(user.last_action);
        const timeWindowSeconds = Math.round((lastAction - firstAction) / 1000) || 1; // Avoid zero
        
        console.log(`Time window: ${timeWindowSeconds} seconds (${firstAction.toISOString()} to ${lastAction.toISOString()})`);
        
        // Check if this user is already being monitored for this reason
        const existingCheck = await query(
          `SELECT id FROM monitored_users 
           WHERE user_id = $1 AND reason = $2 AND status = 'active'`,
          [user.user_id, threshold.reason]
        );
        
        if (existingCheck.rowCount === 0) {
          console.log(`Adding user ${user.user_id} to monitored users list`);
          
          // Add to monitored users table
          await query(
            `INSERT INTO monitored_users 
             (user_id, reason, activity_count, time_window, status) 
             VALUES ($1, $2, $3, $4, 'active')`,
            [user.user_id, threshold.reason, user.action_count, `${timeWindowSeconds} seconds`]
          );
          
          console.log(`✅ User ${user.user_id} added to monitored users for ${threshold.reason}`);
        } else {
          console.log(`User ${user.user_id} already monitored for ${threshold.reason}`);
        }
      }
    }
    
    console.log('Security analysis completed successfully');
  } catch (error) {
    console.error('Error during security analysis:', error);
    // Don't throw - we want the monitor to continue running even if one analysis fails
  }
}

/**
 * Starts the security monitoring background thread
 */
export function startSecurityMonitor() {
  console.log('🔒 Starting security monitoring service...');
  
  // Run immediately on startup
  setTimeout(() => {
    console.log('Running initial security analysis...');
    runSecurityAnalysis().catch(err => console.error('Initial analysis error:', err));
  }, 5000); // Wait 5 seconds for app to fully initialize
  
  // Schedule regular runs
  const intervalId = setInterval(() => {
    console.log('Running scheduled security analysis...');
    runSecurityAnalysis().catch(err => console.error('Scheduled analysis error:', err));
  }, ANALYSIS_INTERVAL_MS);
  
  console.log(`Security monitoring scheduled every ${ANALYSIS_INTERVAL_MS/1000} seconds`);
  
  return {
    stop: () => clearInterval(intervalId),
    runNow: runSecurityAnalysis
  };
}