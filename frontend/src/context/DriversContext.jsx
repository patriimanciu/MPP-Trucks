import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const DriversContext = createContext();

const normalizeDriver = (driver) => {
    if (!driver) return null;
    if (driver._id && !driver.id) {
      return { ...driver, id: driver._id };
    }
    if (!driver.id && !driver._id) {
      return { ...driver, id: Math.floor(Math.random() * 10000) + 1 };
    }
    return driver;
  };

const DriversContextProvider = (props) => {
    const [driverData, setDriverData] = useState([]);
    const [vehicleData, setVehicleData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch drivers
                const driversResponse = await fetch(`${import.meta.env.VITE_API_URL}/drivers`);
                if (!driversResponse.ok) {
                    throw new Error('Failed to fetch drivers');
                }
                const driversData = await driversResponse.json();
                setDriverData(driversData.map(normalizeDriver));

                // Fetch vehicles
                const vehiclesResponse = await fetch(`${import.meta.env.VITE_API_URL}/vehicles`);
                if (!vehiclesResponse.ok) {
                    throw new Error('Failed to fetch vehicles');
                }
                const vehiclesData = await vehiclesResponse.json();
                setVehicleData(vehiclesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const resetDriverData = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/drivers`);
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