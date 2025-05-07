import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDb() {
  try {
    console.log('Testing database connection...');
    const testResult = await query('SELECT NOW()');
    console.log('Database connection successful. Current time:', testResult.rows[0].now);
    
    const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    
    await query(schema);
    console.log('Database schema initialized successfully');
    
    await seedData();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

const driverData = [
    {
        _id: 1,
        name: 'John',
        surname: 'Popescu',
        phone: '0722345678',
        dateOfBirth: '2000-07-14',
        dateOfHiring: '2019-03-20',
        assigned: 'Assigned',
        salary: '8200 RON',
        address: 'Str. Mihai Eminescu 12, București',
        image: ['/assets/people/john.jpg']
    },
    {
        _id: 2,
        name: 'Mihai',
        surname: 'Ionescu',
        phone: '0745678910',
        dateOfBirth: '1990-02-28',
        dateOfHiring: '2021-06-12',
        assigned: 'Assigned',
        salary: '7500 RON',
        address: 'Str. Avram Iancu 8, Cluj-Napoca',
        image: ['/assets/people/mihai.jpg'],
    },
    {
        _id: 3,
        name: 'Andrei',
        surname: 'Marinescu',
        phone: '0733456789',
        dateOfBirth: '1972-11-05',
        dateOfHiring: '2019-09-15',
        assigned: 'Assigned',
        salary: '8800 RON',
        address: 'Bd. Revoluției 34, Timișoara',
        image: ['/assets/people/andrei.jpg'],
    },
    {
        _id: 4,
        name: 'Cristian',
        surname: 'Radu',
        phone: '0721890234',
        dateOfBirth: '2003-06-18',
        dateOfHiring: '2019-01-25',
        assigned: 'Assigned',
        salary: '7200 RON',
        address: 'Str. Mărășești 22, Brașov',
        image: ['/assets/people/cristian.jpg'],
    },
    {
        _id: 6,
        name: 'Elena',
        surname: 'Dumitru',
        phone: '0730123456',
        dateOfBirth: '1987-09-22',
        dateOfHiring: '2020-07-08',
        assigned: 'Assigned',
        salary: '7800 RON',
        address: 'Str. Decebal 17, Constanța',
        image: ['/assets/people/elena.jpg'],
    },
    {
        _id: 7,
        name: 'Raluca',
        surname: 'Enache',
        phone: '0752456789',
        dateOfBirth: '1984-12-30',
        dateOfHiring: '2022-11-03',
        assigned: 'Assigned',
        salary: '8600 RON',
        address: 'Str. Carol I 9, Sibiu',
        image: ['/assets/people/raluca.jpg'],
    },
    {
        _id: 8,
        name: 'Vlad',
        surname: 'Georgescu',
        phone: '0776234678',
        dateOfBirth: '1965-03-12',
        dateOfHiring: '2024-09-10',
        assigned: 'Free',
        salary: '6900 RON',
        address: 'Str. Victoriei 45, Oradea',
        image: ['/assets/people/vlad.jpg'],
    },
    {
        _id: 9,
        name: 'Alex',
        surname: 'Radu',
        phone: '0711678901',
        dateOfBirth: '1980-08-25',
        dateOfHiring: '2024-12-15',
        assigned: 'Free',
        salary: '9300 RON',
        address: 'Bd. Unirii 30, Craiova',
        image: ['/assets/people/alex.jpg'],
    },
    {
        _id: 10,
        name: 'Dan',
        surname: 'Catanescu',
        phone: '0799890123',
        dateOfBirth: '1989-05-07',
        dateOfHiring: '2025-01-22',
        assigned: 'Free',
        salary: '7400 RON',
        address: 'Str. 1 Decembrie 1918 11, Ploiești',
        image: ['/assets/people/dan.jpg'],
    }
];

const vehicleData = [
    {
        _id: 1,
        plate: 'B 78 PME',
        type: 'SemiTruck',
        brand: 'Volvo',
        model: 'FH16',
        year: '2021',
        status: 'Active',
        assignedTo: 'John Popescu',
        location: 'Bucuresti',
        lastUpdate: '2 hours ago',
        capacity: '1000',
        fuel: 'Full',
        mileage: '12000',
        maintenance: 'Good',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/volvo.jpg']
    },
    {
        _id: 2,
        plate: 'CJ 45 KLM',
        type: 'SemiTruck',
        brand: 'Scania',
        model: 'R500',
        year: '2020',
        status: 'Active',
        assignedTo: 'Mihai Ionescu',
        location: 'Cluj-Napoca',
        lastUpdate: '1 day ago',
        capacity: '1100',
        fuel: 'Half',
        mileage: '58000',
        maintenance: 'Fair',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/scania.jpg'],
    },
    {
        _id: 3,
        plate: 'TM 32 XYZ',
        type: 'SemiTruck',
        brand: 'Mercedes-Benz',
        model: 'Actros',
        year: '2019',
        status: 'In Repair',
        assignedTo: 'Andrei Marinescu',
        location: 'Cluj-Napoca',
        lastUpdate: '3 days ago',
        capacity: '1050',
        fuel: 'Low',
        mileage: '87000',
        maintenance: 'Needs Service',
        insurance: 'Expiring Soon',
        best: true,
        image: ['/assets/cars/actros.jpg'],
    },
    {
        _id: 4,
        plate: 'BV 99 LPO',
        type: 'SemiTruck',
        brand: 'MAN',
        model: 'TGX 18.500',
        year: '2022',
        status: 'Active',
        assignedTo: 'Cristian Radu',
        location: 'Beclean',
        lastUpdate: '4 hours ago',
        capacity: '1150',
        fuel: 'Full',
        mileage: '17000',
        maintenance: 'Excellent',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/man.jpg']
    },
    {
        _id: 5,
        plate: 'IS 78 HGR',
        type: 'SemiTruck',
        brand: 'DAF',
        model: 'XF 530',
        year: '2018',
        status: 'Inactive',
        assignedTo: 'Unavailable',
        location: 'Arad',
        lastUpdate: '2 weeks ago',
        capacity: '980',
        fuel: 'Empty',
        mileage: '150000',
        maintenance: 'Needs Repair',
        insurance: 'Expired',
        best: false,
        image: ['/assets/cars/daf.jpg']
    },
    {
        _id: 6,
        plate: 'AR 55 RTY',
        type: 'SemiTruck',
        brand: 'Iveco',
        model: 'S-Way',
        year: '2021',
        status: 'Active',
        assignedTo: 'Elena Dumitru',
        location: 'Arad',
        lastUpdate: '1 hour ago',
        capacity: '1020',
        fuel: 'Three Quarters',
        mileage: '29000',
        maintenance: 'Good',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/iveco.jpg']
    },
    {
        _id: 7,
        plate: 'GL 21 MNB',
        type: 'SemiTruck',
        brand: 'Renault Trucks',
        model: 'T 520',
        year: '2020',
        status: 'Active',
        assignedTo: 'Raluca Enache',
        location: 'Cluj-Napoca',
        lastUpdate: '6 hours ago',
        capacity: '1080',
        fuel: 'Full',
        mileage: '35000',
        maintenance: 'Good',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/renault.jpg']
    },
    {
        _id: 8,
        plate: 'PH 83 JKL',
        type: 'SemiTruck',
        brand: 'Volvo',
        model: 'FH13',
        year: '2022',
        status: 'Active',
        assignedTo: 'George Vasilescu',
        location: 'Arad',
        lastUpdate: '3 hours ago',
        capacity: '1010',
        fuel: 'Full',
        mileage: '22000',
        maintenance: 'Excellent',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/volvo.jpg']
    },
    {
        _id: 9,
        plate: 'AG 67 QWE',
        type: 'SemiTruck',
        brand: 'Scania',
        model: 'R730',
        year: '2021',
        status: 'Active',
        assignedTo: 'Cristian Radu',
        location: 'Beclean',
        lastUpdate: '1 day ago',
        capacity: '1120',
        fuel: 'Three Quarters',
        mileage: '44000',
        maintenance: 'Good',
        insurance: 'Active',
        best: true,
        image: ['/assets/cars/scania.jpg']
    },
    {
        _id: 10,
        plate: 'SV 12 BVC',
        type: 'SemiTruck',
        brand: 'Mercedes-Benz',
        model: 'Arocs',
        year: '2020',
        status: 'Inactive',
        assignedTo: 'Unavailable',
        location: 'Beclean',
        lastUpdate: '1 week ago',
        capacity: '990',
        fuel: 'Low',
        mileage: '69000',
        maintenance: 'Needs Repair',
        insurance: 'Expired',
        best: false,
        image: ['/assets/cars/actros.jpg']
    },
    {
        _id: 11,
        plate: 'SM 45 GFD',
        type: 'SemiTruck',
        brand: 'MAN',
        model: 'TGX 26.640',
        year: '2023',
        status: 'Active',
        assignedTo: 'Andrei Marinescu',
        location: 'Cluj-Napoca',
        lastUpdate: '5 hours ago',
        capacity: '1160',
        fuel: 'Full',
        mileage: '9000',
        maintenance: 'Excellent',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/man.jpg']
    },
    {
        _id: 12,
        plate: 'TM 90 UIO',
        type: 'SemiTruck',
        brand: 'DAF',
        model: 'XF 480',
        year: '2019',
        status: 'In Repair',
        assignedTo: 'Dan Catanescu',
        location: 'Cluj-Napoca',
        lastUpdate: '2 days ago',
        capacity: '1005',
        fuel: 'Half',
        mileage: '82000',
        maintenance: 'Fair',
        insurance: 'Expiring Soon',
        best: false,
        image: ['/assets/cars/daf.jpg']
    },
    {
        _id: 13,
        plate: 'BN 60 ASX',
        type: 'SemiTruck',
        brand: 'Iveco',
        model: 'Stralis',
        year: '2020',
        status: 'Active',
        assignedTo: 'Mihai Ionescu',
        location: 'Beclean',
        lastUpdate: '30 minutes ago',
        capacity: '1040',
        fuel: 'Full',
        mileage: '47000',
        maintenance: 'Good',
        insurance: 'Active',
        best: true,
        image: ['/assets/cars/iveco.jpg']
    },
    {
        _id: 14,
        plate: 'VS 34 QAZ',
        type: 'SemiTruck',
        brand: 'Renault Trucks',
        model: 'T High 480',
        year: '2022',
        status: 'Active',
        assignedTo: 'Mihai Ionescu',
        location: 'Arad',
        lastUpdate: '2 hours ago',
        capacity: '1100',
        fuel: 'Three Quarters',
        mileage: '25000',
        maintenance: 'Excellent',
        insurance: 'Active',
        best: false,
        image: ['/assets/cars/renault.jpg']
    },
    {
        _id: 15,
        plate: 'BR 01 LZA',
        type: 'SemiTruck',
        brand: 'Volvo',
        model: 'FH16',
        year: '2021',
        status: 'Inactive',
        assignedTo: 'Unavailable',
        location: 'Cluj-Napoca',
        lastUpdate: '2 weeks ago',
        capacity: '1000',
        fuel: 'Empty',
        mileage: '120000',
        maintenance: 'Needs Repair',
        insurance: 'Expired',
        best: false,
        image: ['/assets/cars/volvo.jpg']
    }
];

async function seedData() {
  try {
    const result = await query('SELECT COUNT(*) FROM drivers');
    if (parseInt(result.rows[0].count) > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    console.log('Seeding database with drivers and vehicles...');
    
    for (const driver of driverData) {
      await query(
        `INSERT INTO drivers 
         (id, name, surname, phone, date_of_birth, date_of_hiring, assigned_status, salary, address, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          driver._id,
          driver.name,
          driver.surname,
          driver.phone,
          driver.dateOfBirth,
          driver.dateOfHiring,
          driver.assigned === 'Assigned' ? 'Assigned' : 'Free', 
          driver.salary,
          driver.address,
          driver.image[0]
        ]
      );
    }
    
    await query("SELECT setval('drivers_id_seq', (SELECT MAX(id) FROM drivers))");
    
    console.log('Drivers imported successfully');
    
    for (const vehicle of vehicleData) {
      await query(
        `INSERT INTO vehicles
         (id, plate, type, brand, model, year, status, location, last_update, capacity, fuel, mileage, maintenance, insurance, best, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          vehicle._id,
          vehicle.plate,
          vehicle.type,
          vehicle.brand,
          vehicle.model,
          vehicle.year,
          vehicle.status,
          vehicle.location,
          vehicle.lastUpdate,
          vehicle.capacity,
          vehicle.fuel,
          vehicle.mileage,
          vehicle.maintenance,
          vehicle.insurance,
          vehicle.best,
          vehicle.image[0]
        ]
      );
    }
    
    await query("SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM vehicles))");
    
    console.log('Vehicles imported successfully');
    
    console.log('Creating driver-vehicle relationships...');
    
    const driverResult = await query(`SELECT id, name, surname FROM drivers`);
    const driverMap = {};
    driverResult.rows.forEach(driver => {
      const fullName = `${driver.name} ${driver.surname}`;
      driverMap[fullName] = driver.id;
    });
    
    for (const vehicle of vehicleData) {
      if (vehicle.assignedTo && vehicle.assignedTo !== 'Unavailable') {
        const driverId = driverMap[vehicle.assignedTo];
        
        if (driverId) {
          await query(
            `INSERT INTO driver_vehicles (driver_id, vehicle_id, is_primary, notes)
             VALUES ($1, $2, $3, $4)`,
            [driverId, vehicle._id, true, `Primary driver for ${vehicle.brand} ${vehicle.model}`]
          );
          
          console.log(`Assigned vehicle ${vehicle.plate} to driver ${vehicle.assignedTo}`);
        } else {
          console.log(`Warning: Could not find driver "${vehicle.assignedTo}" for vehicle ${vehicle.plate}`);
        }
      }
    }
    
    console.log('Data seeding completed successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initDb().then(() => {
    console.log('Database initialization complete');
    process.exit(0);
  }).catch((err) => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  });
}