import React, { useContext, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { DriversContext } from '../context/DriversContext'
import toast from 'react-hot-toast';

const EditDriver = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { setDrivers } = useContext(DriversContext);
    
    const [driverToEdit, setDriverToEdit] = useState({
        name: '',
        surname: '',
        phone: '',
        image: '',
        dateOfBirth: '',
        dateOfHiring: '',
        address: '',
        assigned: 'Free'
    });

    const [errors, setErrors] = useState({});
    const [isServerReachable, setIsServerReachable] = useState(true);

    useEffect(() => {
        const checkServerStatus = async () => {
            try {
                const response = await fetch('/api/ping');
                setIsServerReachable(response.ok);
            } catch {
                setIsServerReachable(false);
            }
        };
        checkServerStatus();
    }, []);

    useEffect(() => {
        console.log('Fetching driver with ID:', id);
        const fetchDriver = async () => {
          try {
            const response = await fetch(`/api/drivers/${id}`);
            if (!response.ok) {
              throw new Error('Driver not found');
            }
            const driver = await response.json();
            setDriverToEdit(driver);
          } catch (error) {
            console.error('Error fetching driver:', error);
            toast.error('Driver not found');
            navigate('/drivers');
          }
        };
      
        fetchDriver();
      }, [id, navigate]);

    const validateDriver = (driver) => {
        let errors = {};
        if (!driver.name || driver.name.length < 2) errors.name = 'Name is required (min 2 characters)';
        if (!driver.surname || driver.surname.length < 2) errors.surname = 'Surname is required (min 2 characters)';
        if (!driver.phone || !/^\d{10}$/.test(driver.phone)) errors.phone = 'Valid phone number is required (10 digits)';
        if (!driver.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(driver.dateOfBirth))
            errors.dateOfBirth = 'Valid date of birth is required (YYYY-MM-DD)';
        if (!driver.address || driver.address.length < 5) errors.address = 'Address is required (min 5 characters)';
        if (!driver.dateOfHiring || !/^\d{4}-\d{2}-\d{2}$/.test(driver.dateOfHiring)) 
            errors.dateOfHiring = 'Valid date is required (YYYY-MM-DD)';
        return errors;
    }

    useEffect(() => {
        const syncOperations = async () => {
            if (navigator.onLine && isServerReachable) {
                console.log('Syncing queued operations...');
                const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
                const remainingOperations = [];
    
                for (const operation of queuedOperations) {
                    try {
                        if (operation.type === 'UPDATE') {
                            const formData = new FormData();
                            formData.append('driver', JSON.stringify(operation.payload));
                            if (operation.payload.imageFile) {
                                formData.append('file', operation.payload.imageFile);
                            }
    
                            const response = await fetch(`/api/drivers/${operation.id}`, {
                                method: 'PUT',
                                body: formData,
                            });
    
                            if (!response.ok) {
                                throw new Error('Failed to sync UPDATE operation');
                            }
    
                            console.log('Successfully synced UPDATE operation:', operation);
                        }
                    } catch (error) {
                        console.error('Error syncing operation:', error);
                        remainingOperations.push(operation);
                    }
                }
    
                if (remainingOperations.length > 0) {
                    localStorage.setItem('queuedOperations', JSON.stringify(remainingOperations));
                    console.log('Updated queued operations in localStorage:', remainingOperations);
                } else {
                    localStorage.removeItem('queuedOperations');
                    console.log('Cleared queued operations from localStorage.');
                }
            }
        };
    
        syncOperations();
    }, [isServerReachable]);

    const handleSave = async () => {
        const validation = validateDriver(driverToEdit);
        if (Object.keys(validation).length > 0) {
            setErrors(validation);
            return;
        }
    
        const formData = new FormData();
        formData.append('driver', JSON.stringify(driverToEdit));
        if (driverToEdit.imageFile) {
            formData.append('file', driverToEdit.imageFile);
        }
    
        if (!navigator.onLine || !isServerReachable) {
            console.log('Offline or server unreachable. Queuing operation.');
            const { ...driverWithoutFile } = driverToEdit;
            const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
            queuedOperations.push({
                type: 'UPDATE',
                id: driverToEdit._id || driverToEdit.id,
                payload: driverWithoutFile,
            });
            localStorage.setItem('queuedOperations', JSON.stringify(queuedOperations));
    
            toast.success('Changes saved locally. They will sync when back online.');
            navigate('/drivers');
            return;
        }
    
        try {
            console.log('Online and server reachable. Proceeding with API call.');
            const response = await fetch(`/api/drivers/${driverToEdit._id || driverToEdit.id}`, {
                method: 'PUT',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update driver');
            }
    
            const updatedDriver = await response.json();
    
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver._id === updatedDriver._id || driver.id === updatedDriver.id ? updatedDriver : driver
                )
            );
    
            toast.success('Driver updated successfully');
            navigate('/drivers');
        } catch (error) {
            console.error('Error updating driver:', error);
            toast.error(error.message || 'Failed to update driver');
        }
    };

    const handleBack = () => {
        navigate('/drivers');
    };

    return (
        <div className='p-6 max-w-4xl mx-auto pt-16 my-10'>
            {!navigator.onLine && <div className="alert alert-warning">You are offline. Changes will be saved locally.</div>}
            {navigator.onLine && !isServerReachable && <div className="alert alert-danger">Server is unreachable. Changes will sync when the server is back online.</div>}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={driverToEdit.dateOfBirth}
                                    onChange={(e) =>
                                        setDriverToEdit({ ...driverToEdit, dateOfBirth: e.target.value })
                                    }
                                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.dateOfBirth && (
                                    <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
                                )}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    type="text"
                                    value={driverToEdit.address}
                                    onChange={(e) =>
                                        setDriverToEdit({ ...driverToEdit, address: e.target.value })
                                    }
                                    placeholder="Address"
                                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                                )}
                            </div>

                            {/* Driver Image */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setDriverToEdit({ ...driverToEdit, imageFile: e.target.files[0] })}
                                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {driverToEdit.image && (
                                    <div className="mt-4">
                                        <img
                                            src={driverToEdit.image}
                                            alt="Current Profile"
                                            className="w-32 h-32 object-cover rounded-full"
                                        />
                                        <div className="mt-2">
                                            <a
                                                href={driverToEdit.image}
                                                download="profile-picture.jpg"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            >
                                                Download Profile Picture
                                            </a>
                                        </div>
                                    </div>
                                )}
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