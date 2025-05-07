import { query } from '../db.js';

// Get all vehicles
export async function getAllVehicles(sortBy = 'id', sortOrder = 'asc', filters = {}) {
  try {
    let queryText = `
      SELECT v.*, 
             CASE 
               WHEN EXISTS (SELECT 1 FROM driver_vehicles WHERE vehicle_id = v.id) THEN 'Assigned' 
               ELSE 'Unassigned' 
             END AS assigned_status
      FROM vehicles v
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    if (filters.brand) {
      queryText += ` AND v.brand ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.brand}%`);
      paramIndex++;
    }
    
    if (filters.model) {
      queryText += ` AND v.model ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.model}%`);
      paramIndex++;
    }
    
    if (filters.status && filters.status.length > 0) {
      queryText += ` AND (`;
      filters.status.forEach((statusVal, idx) => {
        if (idx > 0) queryText += ` OR `;
        queryText += `v.status = $${paramIndex}`;
        queryParams.push(statusVal);
        paramIndex++;
      });
      queryText += `)`;
    }
    
    if (filters.location && filters.location.length > 0) {
      queryText += ` AND (`;
      filters.location.forEach((locationVal, idx) => {
        if (idx > 0) queryText += ` OR `;
        queryText += `v.location = $${paramIndex}`;
        queryParams.push(locationVal);
        paramIndex++;
      });
      queryText += `)`;
    }
    
    queryText += ` ORDER BY v.${sortBy} ${sortOrder}`;
    
    console.log('Executing query:', queryText);
    console.log('With parameters:', queryParams);
    
    const result = await query(queryText, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    throw error;
  }
}

// Get a vehicle by ID
export async function getVehicleById(id) {
  try {
    const result = await query(
      `SELECT v.*, 
              CASE 
                WHEN EXISTS (SELECT 1 FROM driver_vehicles WHERE vehicle_id = v.id) THEN 'Assigned' 
                ELSE 'Unassigned' 
              END AS assigned_status,
              (SELECT CONCAT(d.name, ' ', d.surname) 
               FROM driver_vehicles dv 
               JOIN drivers d ON d.id = dv.driver_id 
               WHERE dv.vehicle_id = v.id AND dv.is_primary = TRUE
               LIMIT 1) AS assigned_to_name
       FROM vehicles v
       WHERE v.id = $1`,
      [id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in getVehicleById:', error);
    throw error;
  }
}

// Create a new vehicle
export async function createVehicle(vehicleData) {
  try {
    const { 
      plate, type, brand, model, year, status, location, lastUpdate, 
      capacity, fuel, mileage, maintenance, insurance, best, image_url 
    } = vehicleData;
    
    const result = await query(
      `INSERT INTO vehicles 
       (plate, type, brand, model, year, status, location, last_update, capacity, fuel, mileage, maintenance, insurance, best, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [plate, type, brand, model, year, status, location, lastUpdate, capacity, fuel, mileage, maintenance, insurance, best, image_url]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in createVehicle:', error);
    throw error;
  }
}

// Update a vehicle
export async function updateVehicle(id, vehicleData) {
  try {
    const {
      plate, type, brand, model, year, status, location, lastUpdate,
      capacity, fuel, mileage, maintenance, insurance, best, image_url
    } = vehicleData;
    
    const result = await query(
      `UPDATE vehicles 
       SET plate = $1, type = $2, brand = $3, model = $4, year = $5, status = $6, location = $7, 
           last_update = $8, capacity = $9, fuel = $10, mileage = $11, maintenance = $12, 
           insurance = $13, best = $14, image_url = $15, updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [plate, type, brand, model, year, status, location, lastUpdate, capacity, fuel, mileage, maintenance, insurance, best, image_url, id]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateVehicle:', error);
    throw error;
  }
}

// Delete a vehicle
export async function deleteVehicle(id) {
  try {
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteVehicle:', error);
    throw error;
  }
}

// Get all drivers assigned to a vehicle
export async function getVehicleDrivers(vehicleId) {
  try {
    const result = await query(
      `SELECT d.*, dv.is_primary, dv.assigned_date
       FROM drivers d
       JOIN driver_vehicles dv ON d.id = dv.driver_id
       WHERE dv.vehicle_id = $1
       ORDER BY dv.is_primary DESC, d.name, d.surname`,
      [vehicleId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error in getVehicleDrivers:', error);
    throw error;
  }
}