import { query } from '../db.js';

async function createIndices() {
  try {
    console.log('Creating performance indices...');
    
    // These improve JOIN performance
    await query('CREATE INDEX IF NOT EXISTS idx_driver_vehicles_vehicle_id ON driver_vehicles(vehicle_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_driver_vehicles_driver_id ON driver_vehicles(driver_id)');
    
    // These improve filtering and GROUP BY operations
    await query('CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON vehicles(brand)');
    await query('CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(location)');
    await query('CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year)');
    
    // These improve sorting and filtering
    await query('CREATE INDEX IF NOT EXISTS idx_drivers_assigned_status ON drivers(assigned_status)');
    await query('CREATE INDEX IF NOT EXISTS idx_drivers_salary ON drivers(salary)');
    
    console.log('Indices created successfully');
  } catch (error) {
    console.error('Error creating indices:', error);
    throw error;
  }
}

async function runAnalyze() {
  try {
    console.log('Running ANALYZE to update statistics...');
    await query('ANALYZE');
    console.log('ANALYZE complete');
  } catch (error) {
    console.error('Error running ANALYZE:', error);
    throw error;
  }
}

async function main() {
  try {
    await createIndices();
    await runAnalyze();
    console.log('Database optimization complete!');
  } catch (error) {
    console.error('Optimization failed:', error);
  }
}

main();