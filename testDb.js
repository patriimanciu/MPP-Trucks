const db = require('./db');

async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connected successfully!');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Test a simple create table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_timestamp TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Insert a record
    const insertResult = await db.query(
      'INSERT INTO connection_test (test_timestamp) VALUES (NOW()) RETURNING *'
    );
    console.log('Successfully inserted record:', insertResult.rows[0]);
    
    // Query the table
    const selectResult = await db.query('SELECT * FROM connection_test ORDER BY id DESC LIMIT 5');
    console.log('Recent test records:', selectResult.rows);
    
  } catch (error) {
    console.error('Database connection error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  } finally {
    // Close the pool
    process.exit(0);
  }
}

testDatabaseConnection();
