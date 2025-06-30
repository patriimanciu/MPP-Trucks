import { faker } from '@faker-js/faker';
import { query } from './db.js';

const DRIVERS_COUNT = 10000; 
const VEHICLES_COUNT = 10000;
const BATCH_SIZE = 100;

async function generateDrivers() {
  console.log('Starting driver generation...');
  
  try {
    for (let i = 0; i < DRIVERS_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, DRIVERS_COUNT - i);
      const values = [];
      const params = [];
      
      for (let j = 0; j < batchSize; j++) {
        const idx = j * 9;
        values.push(`($${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6}, $${idx+7}, $${idx+8}, $${idx+9})`);
        
        // Fix: Truncate values to ensure they fit in varchar(20)
        const firstName = faker.person.firstName().substring(0, 15);
        const lastName = faker.person.lastName().substring(0, 15);
        
        // FIXED: Correct phone number format
        const phone = faker.phone.number('0###-###-###').substring(0, 15); 
        
        // FIXED: Use the correct status values
        const status = faker.helpers.arrayElement(['Free', 'Assigned', 'On Leave']); 
        
        params.push(
          firstName,
          lastName,
          phone,
          faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
          faker.date.past({ years: 10 }).toISOString().split('T')[0],
          status,
          faker.number.float({ min: 3000, max: 10000, precision: 0.01 }),
          (faker.location.streetAddress() + ', ' + faker.location.city()).substring(0, 200), // Limit address length
          faker.helpers.arrayElement(['/assets/people/driver1.jpg', '/assets/people/driver2.jpg', null])
        );
      }
      
      const queryText = `
        INSERT INTO drivers (name, surname, phone, date_of_birth, date_of_hiring, assigned_status, salary, address, image_url)
        VALUES ${values.join(', ')}
      `;
      
      await query(queryText, params);
      console.log(`Inserted ${i + batchSize} drivers`);
    }
  } catch (error) {
    console.error('Error generating drivers:', error);
    throw error;
  }
  
  console.log(`Successfully generated ${DRIVERS_COUNT} drivers`);
}

async function generateVehicles() {
  console.log('Starting vehicle generation...');
  
  try {
    // Create a set to track used license plates and avoid duplicates
    const usedPlates = new Set();
    
    for (let i = 0; i < VEHICLES_COUNT; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, VEHICLES_COUNT - i);
      const values = [];
      const params = [];
      
      for (let j = 0; j < batchSize; j++) {
        const idx = j * 9;
        values.push(`($${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6}, $${idx+7}, $${idx+8}, $${idx+9})`);
        
        const brand = faker.vehicle.manufacturer().substring(0, 20);
        const model = faker.vehicle.model().substring(0, 20);
        
        // Generate a unique license plate
        let plate;
        let attempts = 0;
        do {
          // Create a more varied plate format to reduce collision chance
          const letterPart = faker.string.alpha(2).toUpperCase();
          const numberPart = faker.string.numeric(2);
          const letterPart2 = faker.string.alpha(3).toUpperCase();
          plate = `${letterPart}-${numberPart}-${letterPart2}`.substring(0, 15);
          attempts++;
          
          // Safety check to prevent infinite loop (extremely unlikely)
          if (attempts > 10) {
            plate = `${letterPart}-${numberPart}-${letterPart2}-${Date.now().toString().slice(-4)}`;
            break;
          }
        } while (usedPlates.has(plate));
        
        // Add the plate to our used set
        usedPlates.add(plate);
        
        const status = faker.helpers.arrayElement(['Active', 'Inactive', 'In Repair']);
        const city = faker.location.city().substring(0, 20);
        const type = faker.helpers.arrayElement(['Sedan', 'SUV', 'Van', 'Truck', 'Bus']).substring(0, 20);
        
        params.push(
          brand,
          model,
          faker.number.int({ min: 2010, max: 2023 }),
          plate,
          status,
          city,
          faker.number.int({ min: 2, max: 50 }),
          faker.helpers.arrayElement(['/assets/vehicles/vehicle1.jpg', '/assets/vehicles/vehicle2.jpg', null]),
          type
        );
      }
      
      const queryText = `
        INSERT INTO vehicles (brand, model, year, plate, status, location, capacity, image_url, type)
        VALUES ${values.join(', ')}
      `;
      
      try {
        await query(queryText, params);
        console.log(`Inserted ${i + batchSize} vehicles`);
      } catch (error) {
        // If we get a duplicate key error, log it and continue with the next batch
        if (error.code === '23505') { // PostgreSQL unique violation error code
          console.error('Duplicate key found, skipping this batch');
          // Could implement more sophisticated retry logic here
        } else {
          throw error; // Re-throw other errors
        }
      }
    }
  } catch (error) {
    console.error('Error generating vehicles:', error);
    throw error;
  }
  
  console.log(`Successfully generated ${VEHICLES_COUNT} vehicles`);
}

async function generateAssignments() {
  console.log('Starting assignment generation...');
  
  try {
    // Get actual counts and available IDs
    const { rows: driverResult } = await query('SELECT COUNT(*) FROM drivers');
    const { rows: vehicleResult } = await query('SELECT COUNT(*) FROM vehicles');
    
    // For more reliability, get actual IDs that exist in the database
    const { rows: driverIds } = await query('SELECT id FROM drivers');
    const { rows: vehicleIds } = await query('SELECT id FROM vehicles');
    
    // Map the IDs to arrays for easy random access
    const availableDriverIds = driverIds.map(row => row.id);
    const availableVehicleIds = vehicleIds.map(row => row.id);
    
    console.log(`Available drivers: ${availableDriverIds.length}, Available vehicles: ${availableVehicleIds.length}`);
    
    if (availableDriverIds.length === 0 || availableVehicleIds.length === 0) {
      console.log("No drivers or vehicles found, skipping assignments");
      return;
    }
    
    const assignmentsCount = Math.floor(availableVehicleIds.length * 0.8);
    const assignedVehicles = new Set();
    
    for (let i = 0; i < assignmentsCount; i += BATCH_SIZE) {
      const batchSize = Math.min(BATCH_SIZE, assignmentsCount - i);
      const values = [];
      const params = [];
      
      let validPairs = 0;
      for (let j = 0; j < batchSize; j++) {
        // Instead of generating random IDs, pick from available ones
        if (availableVehicleIds.length === 0) {
          console.log("No more available vehicles for assignment");
          break;
        }
        
        // Pick a random vehicle ID that hasn't been assigned yet
        let vehicleIndex;
        let vehicleId;
        let attempts = 0;
        
        do {
          vehicleIndex = faker.number.int({ min: 0, max: availableVehicleIds.length - 1 });
          vehicleId = availableVehicleIds[vehicleIndex];
          attempts++;
          
          if (attempts > 10) {
            console.log("Too many attempts to find unassigned vehicle, skipping");
            break;
          }
        } while (assignedVehicles.has(vehicleId));
        
        if (attempts > 10) continue; // Skip this iteration
        
        // Mark vehicle as assigned and remove from available pool
        assignedVehicles.add(vehicleId);
        
        // Pick a random driver ID
        const driverIndex = faker.number.int({ min: 0, max: availableDriverIds.length - 1 });
        const driverId = availableDriverIds[driverIndex];
        
        const idx = validPairs * 3;
        values.push(`($${idx+1}, $${idx+2}, $${idx+3})`);
        
        params.push(
          driverId,
          vehicleId,
          faker.datatype.boolean() // is_primary
        );
        
        validPairs++;
      }
      
      // Skip if no valid pairs found
      if (validPairs === 0) {
        console.log("No valid assignments in this batch, skipping");
        continue;
      }
      
      const queryText = `
        INSERT INTO driver_vehicles (driver_id, vehicle_id, is_primary)
        VALUES ${values.join(', ')}
        ON CONFLICT (vehicle_id, driver_id) DO NOTHING
      `;
      
      try {
        await query(queryText, params);
        console.log(`Created ${validPairs} assignments`);
      } catch (error) {
        console.error('Error in assignment batch:', error.message);
        console.log('Continuing with next batch...');
      }
    }
    
    // Update driver status for assigned drivers
    try {
      await query(`
        UPDATE drivers
        SET assigned_status = 'Assigned'
        WHERE id IN (SELECT DISTINCT driver_id FROM driver_vehicles)
      `);
      console.log('Updated assigned drivers status');
    } catch (error) {
      console.error('Error updating driver status:', error.message);
    }
    
  } catch (error) {
    console.error('Error generating assignments:', error);
    throw error;
  }
}

async function main() {
  try {
    await generateDrivers();
    await generateVehicles();
    await generateAssignments();
    console.log('Data generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error in data generation:', error);
    process.exit(1);
  }
}

main();