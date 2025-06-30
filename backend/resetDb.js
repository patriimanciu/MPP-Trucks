import { query } from './db.js';
import { fileURLToPath } from 'url';

async function resetDatabase() {
  try {
    console.log('Resetting database...');
    
    console.log('Dropping triggers...');
    await query(`
      DROP TRIGGER IF EXISTS update_drivers_modtime ON drivers;
      DROP TRIGGER IF EXISTS update_vehicles_modtime ON vehicles;
      DROP FUNCTION IF EXISTS update_modified_column();
    `);
    
    console.log('Dropping tables...');
    await query(`
      DROP TABLE IF EXISTS driver_vehicles CASCADE;
      DROP TABLE IF EXISTS monitored_users CASCADE;
      DROP TABLE IF EXISTS vehicles CASCADE;
      DROP TABLE IF EXISTS drivers CASCADE;
    `);
    
    console.log('Database reset successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase().then(() => {
    console.log('Database reset complete. You can now run initDb.js to recreate it.');
    process.exit(0);
  }).catch((err) => {
    console.error('Database reset failed:', err);
    process.exit(1);
  });
}