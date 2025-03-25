import { createContext, useState, useEffect } from "react";
import { driverData as initialDriverData, vehicleData } from "../assets/assets";

// eslint-disable-next-line react-refresh/only-export-components
export const DriversContext = createContext();

// Helper function to normalize driver data to use consistent id format
const normalizeDriver = (driver) => {
  if (!driver) return null;
  
  // If the driver has _id but no id, use _id as id
  if (driver._id && !driver.id) {
    return {
      ...driver,
      id: driver._id
    };
  }
  
  // If the driver has neither id nor _id, generate a new one
  if (!driver.id && !driver._id) {
    return {
      ...driver,
      id: Math.floor(Math.random() * 10000) + 1
    };
  }
  
  // Otherwise, return the driver as is (it already has an id)
  return driver;
};

const DriversContextProvider = (props) => {
    const [driverData, setDriverData] = useState(() => {
        try {
            const savedDrivers = localStorage.getItem('driverData');
            if (savedDrivers) {
                // Parse and normalize the saved drivers
                const parsedDrivers = JSON.parse(savedDrivers);
                return Array.isArray(parsedDrivers) 
                    ? parsedDrivers.map(normalizeDriver) 
                    : initialDriverData.map(normalizeDriver);
            }
            return initialDriverData.map(normalizeDriver);
        } catch (error) {
            console.error("Error loading driver data:", error);
            return initialDriverData.map(normalizeDriver);
        }
    });

    useEffect(() => {
        try {
            // Normalize before saving
            const normalizedDrivers = driverData.map(normalizeDriver);
            localStorage.setItem('driverData', JSON.stringify(normalizedDrivers));
        } catch (error) {
            console.error("Error saving driver data:", error);
        }
    }, [driverData]);
    
    // Reset function
    const resetDriverData = () => {
        localStorage.removeItem('driverData');
        setDriverData(initialDriverData.map(normalizeDriver));
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