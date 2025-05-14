import { createLog } from './models/Log.js';

export function logActivity(entityType) {
  return async (req, res, next) => {
    // Skip logging for GET requests
    if (req.method === 'GET') {
      return next();
    }
    
    // Store original send method
    const originalSend = res.send;
    
    // Override send method to capture response
    res.send = function(data) {
      // Get the response body if it's JSON
      let responseBody = {};
      try {
        if (typeof data === 'string') {
          responseBody = JSON.parse(data);
        } else if (typeof data === 'object') {
          responseBody = data;
        }
      } catch (e) {
        // Not valid JSON, use as is
        responseBody = { data };
      }
      
      // Determine action based on request method
      let action;
      let entityId;
      
      switch (req.method) {
        case 'POST':
          action = 'create';
          entityId = responseBody.id || responseBody._id;
          break;
        case 'PUT':
        case 'PATCH':
          action = 'update';
          entityId = req.params.id;
          break;
        case 'DELETE':
          action = 'delete';
          entityId = req.params.id;
          break;
        default:
          action = 'other';
          entityId = req.params.id || null;
      }
      
      // Log activity if authenticated
      if (req.userId) {
        createLog(
          req.userId,
          action,
          entityType,
          entityId,
          {
            method: req.method,
            path: req.path,
            query: req.query,
            params: req.params,
            body: req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' ? req.body : undefined
          }
        ).catch(err => console.error('Error logging activity:', err));
      }
      
      // Call original send method
      originalSend.call(this, data);
      return this;
    };
    
    next();
  };
}