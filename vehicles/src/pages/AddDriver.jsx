import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { DriversContext } from '../context/DriversContext'
import toast from 'react-hot-toast';

const AddDriver = () => {
    const navigate = useNavigate();
    const { driverData, setDrivers } = useContext(DriversContext);
    const [newDriver, setNewDriver] = useState({
        name: '',
        surname: '',
        phone: '',
        image: '',
        dateOfHiring: '',
        assigned: 'Free'
    });

    const [errors, setErrors] = useState({});

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

    const handleAdd = () => {
        const validation = validateDriver(newDriver);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return;
        }
    
        const existingIds = driverData.map(driver => {
            if (driver.id !== undefined) return driver.id;
            if (driver._id !== undefined) return driver._id;
            return 0;
        });
    
        const newId = Math.max(...existingIds, 0) + 1;
        
        console.log("Existing IDs:", existingIds);
        console.log("Generated new ID:", newId);

        const driverToAdd = {
            ...newDriver,
            id: newId,
        };
    
        if (typeof setDrivers === 'function') {
            setDrivers([...driverData, driverToAdd]);
            toast.success('Driver added successfully');
            
            setTimeout(() => {
                navigate('/drivers');
            }, 1500);
        } else {
            toast.error('Could not add driver.');
        }
    };

    const handleBack = () => {
        navigate('/drivers');
    };

    return (
        <div className='p-6 max-w-4xl mx-auto pt-16 my-10'>
            <div className="flex justify-between items-center mb-6">
                <h2 className='text-2xl font-bold'>Add New Driver</h2>
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
                                    value={newDriver.name} 
                                    onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })} 
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
                                    value={newDriver.surname} 
                                    onChange={(e) => setNewDriver({ ...newDriver, surname: e.target.value })} 
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
                                    value={newDriver.phone} 
                                    onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })} 
                                    placeholder="Phone Number" 
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                />
                                {errors.phone && <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>}
                            </div>

                            {/* Driver Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                <select 
                                    value={newDriver.image} 
                                    onChange={(e) => setNewDriver({ ...newDriver, image: e.target.value })} 
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
                                    value={newDriver.dateOfHiring} 
                                    onChange={(e) => setNewDriver({ ...newDriver, dateOfHiring: e.target.value })} 
                                    max={new Date().toISOString().split('T')[0]}
                                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0]}
                                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                                />
                                {errors.dateOfHiring && <p className='text-red-500 text-sm mt-1'>{errors.dateOfHiring}</p>}
                            </div>

                            {/* Assignment Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Status</label>
                                <select 
                                    value={newDriver.assigned} 
                                    onChange={(e) => setNewDriver({ ...newDriver, assigned: e.target.value })} 
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
                        onClick={handleAdd} 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Add Driver
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddDriver