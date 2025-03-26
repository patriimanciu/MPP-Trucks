import { createContext, useState } from "react";
import { driverData as initialDriverData, vehicleData } from "../assets/assets";

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
    const [driverData, setDriverData] = useState(() => {
        return initialDriverData.map(normalizeDriver);
    });
    
    const resetDriverData = () => {
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