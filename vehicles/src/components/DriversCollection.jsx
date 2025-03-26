import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { DriversContext } from '../context/DriversContext'
import Title from './Title'
import { toast } from 'react-hot-toast'

const DriversCollection = ({ onAdd, onEdit }) => {
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
          case 'free': return 'bg-green-100 text-green-800';
          case 'assigned': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      };

    const { driverData, setDrivers } = useContext(DriversContext);
    const [allDrivers, setAllDrivers] = useState([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    useEffect(() => {
        setAllDrivers(driverData);
    }, [driverData])
    
    const indexOfLastDriver = currentPage * itemsPerPage;
    const indexOfFirstDriver = indexOfLastDriver - itemsPerPage;
    const currentDrivers = allDrivers?.slice(indexOfFirstDriver, indexOfLastDriver) || [];
    const totalPages = Math.ceil((allDrivers?.length || 0) / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleAddClick = () => {
        if (onAdd) {
        onAdd();
        } else {
        console.log("Add new driver");
        }
    };

    const handleDelete = (driverId) => {
        if (window.confirm('Are you sure you want to delete this driver?')) {
            try {
                let driverToDelete = driverData.find(driver => driver.id === driverId);
                if (!driverToDelete) {
                    driverToDelete = driverData.find(driver => driver._id === driverId);
                }
                
                if (!driverToDelete) {
                    toast.error(`Driver with ID ${driverId} not found.`);
                    console.error('Available drivers:', driverData);
                    return;
                }
                const updatedDrivers = driverData.filter(driver => 
                    driver.id !== driverId && (driver._id !== driverId || driver._id === undefined)
                );
                
                setDrivers(updatedDrivers);
                setAllDrivers(updatedDrivers);
                
                toast.success(`${driverToDelete.name} ${driverToDelete.surname} was deleted successfully`);
                const newTotalPages = Math.ceil(updatedDrivers.length / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            } catch (error) {
                toast.error("Failed to delete driver: " + error.message);
            }
        }
    };

    if (!allDrivers || !Array.isArray(allDrivers)) {
        return <div>Loading drivers data...</div>
    }

    return (
        <div className='my-10 pt-16'>
            <div className='text-center py-4 text-3xl'>
                <Title text={'Drivers'}/>
            </div>

            {/* Add Button */}
            <div className="flex justify-end mb-6">
                <button
                    onClick={handleAddClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Driver
                </button>
            </div>
            
            {/* Pagination controls */}
            <div className="flex flex-wrap justify-between items-center mb-6">
                <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                    <span className="text-sm text-gray-600">Show</span>
                    <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="border rounded p-1 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                    <span className="text-sm text-gray-600">per page</span>
                </div>
                
                <div className="text-sm text-gray-600">
                    Showing {indexOfFirstDriver + 1}-{Math.min(indexOfLastDriver, allDrivers.length)} of {allDrivers.length} drivers
                </div>
            </div>

            {/* Table layout with actions */}
            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Hiring</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentDrivers.map((driver, index) => (
                            <tr key={driver.id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {driver.image ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={driver.image} alt={`${driver.name} ${driver.surname}`} />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    {driver.name?.charAt(0)}{driver.surname?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{driver.name} {driver.surname}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{driver.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{driver.dateOfHiring}</div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(driver.assigned)}`} style={{ width: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {driver.assigned}
                                    </span>
                                </td>

                                
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(driver.id)}
                                        className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-md mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(driver.id)}
                                        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Page navigation */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex items-center">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-l border ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        
                        <div className="flex">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 border-t border-b ${currentPage === i + 1 ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-r border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    )
}

export default DriversCollection