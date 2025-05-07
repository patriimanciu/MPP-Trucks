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

// Create a new driver
export async function createDriver(driverData) {
  try {
    console.log('Creating driver with data:', driverData);
    
    const queryText = `
      INSERT INTO drivers (
        name, surname, phone, date_of_birth, date_of_hiring, 
        assigned_status, salary, address, image_url
      ) VALUES ($1, $2, $3, $4::date, $5::date, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      driverData.name,
      driverData.surname,
      driverData.phone,
      driverData.date_of_birth,
      driverData.date_of_hiring,
      driverData.assigned_status,
      driverData.salary,
      driverData.address,
      driverData.image_url
    ];
    
    console.log('Query values:', values);
    const result = await query(queryText, values);
    console.log('Insert result:', result.rows[0]);
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