DROP TRIGGER IF EXISTS update_drivers_modtime ON drivers;
DROP TRIGGER IF EXISTS update_vehicles_modtime ON vehicles;
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;

-- Drop tables in proper order
DROP TABLE IF EXISTS driver_vehicles CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  date_of_hiring DATE NOT NULL,
  assigned_status VARCHAR(20) NOT NULL DEFAULT 'Free',
  salary VARCHAR(30),
  address TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate VARCHAR(20) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  year VARCHAR(4) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  location VARCHAR(100),
  last_update VARCHAR(50),
  capacity VARCHAR(20),
  fuel VARCHAR(20) DEFAULT 'Empty',
  mileage VARCHAR(20) DEFAULT '0',
  maintenance VARCHAR(20) DEFAULT 'Good',
  insurance VARCHAR(20) DEFAULT 'Active',
  best BOOLEAN DEFAULT FALSE,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS driver_vehicles (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL,
  vehicle_id INTEGER NOT NULL,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  UNIQUE(driver_id, vehicle_id) -- Prevent duplicate assignments
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_driver_modtime
BEFORE UPDATE ON drivers
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_vehicle_modtime
BEFORE UPDATE ON vehicles
FOR EACH ROW EXECUTE FUNCTION update_modified_column();