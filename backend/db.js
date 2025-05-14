// Database connection with environment detection
let pool;
let isCloudflareEnv = false;

async function initPool() {
  try {
    // Detect the environment - check if we're in Cloudflare Workers
    try {
      isCloudflareEnv = typeof caches !== 'undefined' && 
                        typeof navigator !== 'undefined' && 
                        navigator.userAgent.includes('Cloudflare-Workers');
    } catch (e) {
      isCloudflareEnv = false;
    }
    
    console.log(`Initializing database in ${isCloudflareEnv ? 'Cloudflare' : 'Node.js'} environment`);
    
    if (isCloudflareEnv) {
      // Cloudflare environment
      try {
        const { Pool } = await import('@neondatabase/serverless');
        pool = new Pool({
          connectionString: process.env.DATABASE_URL || 'postgresql://driveruser:yourpassword@localhost:5432/driverdb'
        });
      } catch (error) {
        console.error('Failed to initialize Cloudflare DB connection:', error);
        throw error;
      }
    } else {
      // Standard Node.js environment
      const { Pool } = await import('pg');
      pool = new Pool({
        user: process.env.DB_USER || 'driveruser',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'driverdb',
        password: process.env.DB_PASSWORD || 'yourpassword',
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: process.env.NODE_ENV === 'production' ? 
          { rejectUnauthorized: false } : false
      });
    }
    
    // Test connection
    const testResult = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', testResult.rows[0]);
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Initialize the pool immediately
const poolPromise = initPool();

export async function query(text, params) {
  // Ensure pool is initialized
  await poolPromise;
  
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  // Ensure pool is initialized
  await poolPromise;
  
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for too long!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };
  
  return client;
}

// Export the pool for direct access if needed
export async function getPool() {
  await poolPromise;
  return pool;
}