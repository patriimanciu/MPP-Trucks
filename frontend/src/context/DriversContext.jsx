import { createContext, useState, useEffect } from "react";
import { vehicleData } from "../../../backend/data/vehicles.js";

// eslint-disable-next-line react-refresh/only-export-components
export const DriversContext = createContext();

const normalizeDriver = (driver) => {
  if (!driver) return null;
  
  if (driver._id && !driver.id) {
    return {
      ...driver,
      id: driver._id
    };
  }
  
  if (!driver.id && !driver._id) {
    return {
      ...driver,
      id: Math.floor(Math.random() * 10000) + 1
    };
  }
  
  return driver;
};

const DriversContextProvider = (props) => {
    const [driverData, setDriverData] = useState([]);
    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await fetch('http://localhost:5002/api/drivers');
                if (!response.ok) {
                    throw new Error('Failed to fetch drivers');
                }
                const data = await response.json();
                setDriverData(data.map(normalizeDriver));
            } catch (error) {
                console.error('Error fetching drivers:', error);
            }
        };

        fetchDrivers();
    }, []);

    const resetDriverData = async () => {
      try {
          const response = await fetch('http://localhost:5002/api/drivers');
          if (!response.ok) {
              throw new Error('Failed to reset drivers');
          }
          const data = await response.json();
          setDriverData(data.map(normalizeDriver));
      } catch (error) {
          console.error('Error resetting drivers:', error);
      }
  };
    
    const value = {
        driverData,
        vehicleData,
        setDrivers: setDriverData,
        resetDriverData
    }

    return (
        <DriversContext.Provider value={value}>
            {props.children}
        </DriversContext.Provider>
    )
}

export default DriversContextProvider;