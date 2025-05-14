import { query } from '../db.js';

// Get all drivers
export async function getAllDrivers(sortBy = 'name', sortOrder = 'asc', filters = {}) {
  try {
    let queryText = 'SELECT * FROM drivers WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;
    
    if (filters.name) {
      queryText += ` AND name ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.name}%`);
      paramIndex++;
    }
    
    if (filters.surname) {
      queryText += ` AND surname ILIKE $${paramIndex}`;
      queryParams.push(`%${filters.surname}%`);
      paramIndex++;
    }
    
    if (filters.assigned_status) {
      queryText += ` AND assigned_status = $${paramIndex}`;
      queryParams.push(filters.assigned_status);
      paramIndex++;
    }
    
    queryText += ` ORDER BY ${sortBy} ${sortOrder}`;
    
    const result = await query(queryText, queryParams);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllDrivers:', error);
    throw error;
  }
}

// Get a driver by ID
export async function getDriverById(id) {
  try {
    const result = await query('SELECT * FROM drivers WHERE id = $1', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in getDriverById:', error);
    throw error;
  }
}

export async function getDriversByUserId(userId) {
  const result = await query('SELECT * FROM drivers WHERE created_by = $1', [userId]);
  return result.rows;
}

export async function createDriver(driver) {
  try {
    // No need to process image here - already handled in route
    const result = await query(
      `INSERT INTO drivers 
       (name, surname, phone, date_of_birth, date_of_hiring, assigned_status, 
        address, image_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [
        driver.name,
        driver.surname,
        driver.phone,
        driver.date_of_birth,
        driver.date_of_hiring,
        driver.assigned_status,
        driver.address,
        driver.image_url, // Already processed to be null if no image
        driver.created_by
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in createDriver:', error);
    throw error;
  }
}

export async function updateDriver(id, driverData) {
  try {
    let birthDate = null;
    let hiringDate = null;
    
    if (driverData.dateOfBirth) {
      try {
        birthDate = driverData.dateOfBirth;
        console.log('Formatted birth date:', birthDate);
      } catch (e) {
        console.error('Error formatting birth date:', e);
      }
    }
    
    if (driverData.dateOfHiring) {
      try {
        hiringDate = driverData.dateOfHiring;
        console.log('Formatted hiring date:', hiringDate);
      } catch (e) {
        console.error('Error formatting hiring date:', e);
      }
    }
    const formattedData = {
      ...driverData,
      date_of_birth: driverData.dateOfBirth || null,
      date_of_hiring: driverData.dateOfHiring || null,
      assigned_status: driverData.assigned,
      image_url: Array.isArray(driverData.image) && driverData.image.length > 0 
        ? driverData.image[0] 
        : (driverData.image || null)
    };

    delete formattedData.dateOfBirth;
    delete formattedData.dateOfHiring;
    delete formattedData.assigned;
    delete formattedData.image;
    delete formattedData._id;

    console.log('Formatted data for database update:', formattedData);

    const queryText = `
      UPDATE drivers
      SET 
        name = $1,
        surname = $2,
        phone = $3,
        date_of_birth = $4,
        date_of_hiring = $5,
        assigned_status = $6,
        salary = $7,
        address = $8,
        image_url = $9
      WHERE id = $10
      RETURNING *
    `;

    const values = [
      formattedData.name,
      formattedData.surname,
      formattedData.phone,
      formattedData.date_of_birth,
      formattedData.date_of_hiring,
      formattedData.assigned_status,
      formattedData.salary,
      formattedData.address,
      formattedData.image_url,
      id
    ];

    const result = await query(queryText, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in updateDriver:', error);
    throw error;
  }
}

// Delete a driver
export async function deleteDriver(id) {
  try {
    const result = await query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error in deleteDriver:', error);
    throw error;
  }
}

// Get all vehicles for a specific driver
export async function getDriverVehicles(driverId) {
  try {
    const result = await query(
      `SELECT v.*, dv.is_primary, dv.assigned_date
       FROM vehicles v
       JOIN driver_vehicles dv ON v.id = dv.vehicle_id
       WHERE dv.driver_id = $1
       ORDER BY dv.is_primary DESC, v.brand, v.model`,
      [driverId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Error in getDriverVehicles:', error);
    throw error;
  }
}

// Assign a vehicle to a driver
export async function assignVehicle(driverId, vehicleId, isPrimary = false) {
  try {
    if (isPrimary) {
      await query(
        'UPDATE driver_vehicles SET is_primary = FALSE WHERE driver_id = $1 AND is_primary = TRUE',
        [driverId]
      );
    }
    
    const result = await query(
      `INSERT INTO driver_vehicles (driver_id, vehicle_id, is_primary) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (driver_id, vehicle_id) 
       DO UPDATE SET is_primary = $3, assigned_date = NOW()
       RETURNING *`,
      [driverId, vehicleId, isPrimary]
    );
    
    await query('UPDATE drivers SET assigned_status = $1 WHERE id = $2', ['Assigned', driverId]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in assignVehicle:', error);
    throw error;
  }
}

// Unassign a vehicle from a driver
export async function unassignVehicle(driverId, vehicleId) {
  try {
    const result = await query(
      'DELETE FROM driver_vehicles WHERE driver_id = $1 AND vehicle_id = $2 RETURNING *',
      [driverId, vehicleId]
    );
    
    const remainingResult = await query(
      'SELECT COUNT(*) FROM driver_vehicles WHERE driver_id = $1',
      [driverId]
    );
    
    if (parseInt(remainingResult.rows[0].count) === 0) {
      await query('UPDATE drivers SET assigned_status = $1 WHERE id = $2', ['Unassigned', driverId]);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in unassignVehicle:', error);
    throw error;
  }
}