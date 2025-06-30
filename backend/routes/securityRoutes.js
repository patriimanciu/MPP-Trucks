import express from 'express';
import { query } from '../db.js';
import { getMonitoredUsers, updateStatus } from '../models/MonitoredUser.js';
import { runSecurityAnalysis } from '../securityMonitor.js';
import { auth, authorize } from '../auth.js';

const router = express.Router();

router.get('/monitored-users', auth, authorize('admin'), async (req, res) => {
  try {
    const monitoredUsers = await getMonitoredUsers();
    res.json(monitoredUsers);
  } catch (error) {
    console.error('Error getting monitored users:', error);
    res.status(500).json({ message: 'Failed to get monitored users' });
  }
});

router.put('/monitored-users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updatedUser = await updateStatus(
      req.params.id,
      status,
      req.userId,
      notes
    );
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating monitored user:', error);
    res.status(500).json({ message: 'Failed to update monitored user' });
  }
});

router.post('/run-security-analysis', auth, authorize('admin'), async (req, res) => {
  try {
    await runSecurityAnalysis();
    res.json({ message: 'Security analysis triggered successfully' });
  } catch (error) {
    console.error('Error triggering security analysis:', error);
    res.status(500).json({ message: 'Failed to trigger security analysis' });
  }
});

router.post('/simulate-attack', auth, async (req, res) => {
    try {
      const { actionType, count } = req.body;
      
      if (!actionType || !count) {
        return res.status(400).json({ message: 'Action type and count are required' });
      }
      
      console.log(`Simulating ${count} ${actionType} actions for user ${req.userId}`);
      
      const logs = [];
      for (let i = 0; i < count; i++) {
        logs.push({
          user_id: req.userId,
          action: actionType,
          entity_type: 'driver',
          entity_id: `sim-${i}`,
          details: JSON.stringify({ simulation: true, attempt: i })
        });
      }
      
      for (const log of logs) {
        await query(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
          [log.user_id, log.action, log.entity_type, log.entity_id, log.details]
        );
      }
      
      await runSecurityAnalysis();
      
      res.json({ 
        message: `Successfully simulated ${count} ${actionType} actions. Security analysis triggered.` 
      });
    } catch (error) {
      console.error('Error simulating attack:', error);
      res.status(500).json({ message: 'Failed to simulate attack: ' + error.message });
    }
  });

  router.post('/reset-monitoring', auth, async (req, res) => {
    try {
      // Clear monitored users table
      await query('DELETE FROM monitored_users');
      
      // Optionally clear logs too if specified
      if (req.body.clearLogs) {
        await query('DELETE FROM activity_logs');
      }
      
      res.json({ message: 'Security monitoring data reset successfully' });
    } catch (error) {
      console.error('Error resetting security monitoring:', error);
      res.status(500).json({ message: 'Failed to reset security monitoring' });
    }
  });

export default router;