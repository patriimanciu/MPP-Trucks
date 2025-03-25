import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { DriversContext } from '../context/DriversContext'
import toast from 'react-hot-toast';

const EditDriver = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get the driver ID from the URL - renamed from _id to id
    const { driverData, setDrivers } = useContext(DriversContext);
    
    const [driverToEdit, setDriverToEdit] = useState({
        name: '',
        surname: '',
        phone: '',
        image: '',
        dateOfHiring: '',
        assigned: 'Free'
    });

    const [errors, setErrors] = useState({});

    // Find the driver to edit when component loads
    useEffect(() => {
        try {
            // Convert to number if it's a string
            const driverId = parseInt(id);
            
            console.log("Looking for driver with ID:", driverId);
            console.log("Available drivers:", driverData);
            
            // Try to find by id first
            let foundDriver = driverData.find(driver => driver.id === driverId);
            
            // If not found with id, try with _id as fallback
            if (!foundDriver) {
                foundDriver = driverData.find(driver => driver._id === driverId);
            }
            
            if (foundDriver) {
                console.log("Found driver:", foundDriver);
                // Ensure the driver has consistent id
                const normalizedDriver = {
                    ...foundDriver,
                    id: driverId // Ensure id is set to what we searched for
                };
                setDriverToEdit(normalizedDriver);
            } else {
                console.error("Driver not found. Available drivers:", driverData);
                toast.error(`Driver with ID ${driverId} not found`);
                setTimeout(() => {
                    navigate('/drivers');
                }, 1500);
            }
        } catch (error) {
            console.error("Error in EditDriver:", error);
            toast.error(`Error finding driver: ${error.message}`);
            navigate('/drivers');
        }
    }, [id, driverData, navigate]);

    const imageOptions = [
        { value: '', label: 'No Image' }
    ];

    const validateDriver = (driver) => {
        let errors = {};
        if (!driver.name || driver.name.length < 2) errors.name = 'Name is required (min 2 characters)';
        if (!driver.surname || driver.surname.length < 2) errors.surname = 'Surname is required (min 2 characters)';
        if (!driver.phone || !/^\d{10}$/.test(driver.phone)) errors.phone = 'Valid phone number is required (10 digits)';
        if (!driver.dateOfHiring || !/^\d{4}-\d{2}-\d{2}$/.test(driver.dateOfHiring)) 
            errors.dateOfHiring = 'Valid date is required (YYYY-MM-DD)';
        return errors;
    }

    const handleSave = () => {
        const validation = validateDriver(driverToEdit);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return;
        }

        if (typeof setDrivers === 'function') {
            // Map through all drivers and replace the one being edited
            // Use both id and _id for comparison to be safe
            const updatedDrivers = driverData.map(driver => {
                if (driver.id === driverToEdit.id || 
                    (driver._id && driver._id === driverToEdit.id)) {
                    return driverToEdit;
                }
                return driver;
            });
            
            setDrivers(updatedDrivers);
            toast.success('Driver updated successfully');
            
            setTimeout(() => {
                navigate('/drivers');
            }, 1500);
        } else {
            toast.error('Could not update driver. Update function not available.');
        }
    };

    const handleBack = () => {
        navigate('/drivers');
    };

    return (
        <div className='p-6 max-w-4xl mx-auto pt-16 my-10'>
            <div className="flex justify-between items-center mb-6">
                <h2 className='text-2xl font-bold'>Edit Driver</h2>
                <button
                    onClick={handleBack}
                    className="text-blue-600 hover:text-blue-800"
                >
                    &larr; Back to Drivers
                </button>
            </div>
            <div className='bg-white shadow-md rounded-lg p-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                    {/* Personal Information */}
                    <div className="col-span-2 border-b pb-4 mb-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input 
                                    type="text"
                                    value={driverToEdit.name} 
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, name: e.target.value })} 
                                    placeholder="First Name" 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                />
                                {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
                            </div>

                            {/* Surname */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input 
                                    type="text"
                                    value={driverToEdit.surname} 
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, surname: e.target.value })} 
                                    placeholder="Last Name" 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                />
                                {errors.surname && <p className='text-red-500 text-sm mt-1'>{errors.surname}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input 
                                    type="text"
                                    value={driverToEdit.phone} 
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, phone: e.target.value })} 
                                    placeholder="Phone Number" 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                />
                                {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>}
                            </div>

                            {/* Driver Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                <select 
                                    value={driverToEdit.image} 
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, image: e.target.value })} 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Select Image</option>
                                    {imageOptions.map(opt => 
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Employment Information */}
                    <div className="col-span-2">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Employment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Date of Hiring */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Hiring</label>
                                <input 
                                    type="date"
                                    value={driverToEdit.dateOfHiring} 
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, dateOfHiring: e.target.value })} 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                />
                                {errors.dateOfHiring && <p className='text-red-500 text-sm mt-1'>{errors.dateOfHiring}</p>}
                            </div>

                            {/* Assignment Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Status</label>
                                <select 
                                    value={driverToEdit.assigned} 
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, assigned: e.target.value })} 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value="Free">Free</option>
                                    <option value="Assigned">Assigned</option>
                                    <option value="On Leave">On Leave</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSave} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EditDriver