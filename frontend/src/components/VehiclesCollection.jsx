import React from 'react'
import { useContext, useEffect, useState } from 'react'
import { DriversContext } from '../context/DriversContext'
import VehicleItem from './VehicleItem'

const VehiclesCollection = () => {

    const { vehicleData } = useContext(DriversContext);
    const [allVehicles, setAllVehicles] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        if (vehicleData && Array.isArray(vehicleData)) {
          console.log("Setting vehicle data, length:", vehicleData.length);
          setAllVehicles(vehicleData);
        } else {
          console.warn("vehicleData is not an array:", vehicleData);
          setAllVehicles([]); // Set to empty array if data is invalid
        }
      }, [vehicleData]);

    const indexOfLastDriver = currentPage * itemsPerPage;
    const indexOfFirstDriver = indexOfLastDriver - itemsPerPage;
    const currentVehicles = allVehicles && Array.isArray(allVehicles) 
        ? allVehicles.slice(indexOfFirstDriver, indexOfLastDriver) 
        : [];
    const totalPages = Math.ceil((allVehicles?.length || 0) / itemsPerPage);

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
  };
  
  const handleItemsPerPageChange = (e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1); 
  };

    console.log("Vehicle data in context:", vehicleData);
    console.log("All vehicles state:", allVehicles);

    if (!allVehicles || !Array.isArray(allVehicles)) {
        return <div>Loading vehicles data...</div>
    }

  return (
    <div className='my-5 ml-5'>
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
                Showing {indexOfFirstDriver + 1}-{Math.min(indexOfLastDriver, allVehicles.length)} of {allVehicles.length} vehicles
            </div>
        </div>

        {/* Rendring Vehicles */}
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6'>
          {
            currentVehicles.map((item, index) => (
                <VehicleItem 
                    key={index} 
                    id={item.id} 
                    image={item.image} 
                    plate={item.plate}
                    brand={item.brand}
                    model={item.model}
                    status={item.status}
                    location={item.location}
                    assignedTo={item.assignedTo}
                    borderColor = {item.borderColor}
                  />))
          }
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

export default VehiclesCollection
