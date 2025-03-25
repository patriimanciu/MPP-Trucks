import React, { useEffect, useState, useContext} from 'react'
import { DriversContext } from '../context/DriversContext'
import Title from '../components/Title'
import VehicleItem from '../components/VehicleItem';


const Vehicles = () => {
    const { vehicleData } = useContext(DriversContext);
    const [allVehicles, setAllVehicles] = useState([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const indexOfLastDriver = currentPage * itemsPerPage;
    const indexOfFirstDriver = indexOfLastDriver - itemsPerPage;
    const currentVehicles = allVehicles?.slice(indexOfFirstDriver, indexOfLastDriver) || [];
    const totalPages = Math.ceil((allVehicles?.length || 0) / itemsPerPage);

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1); 
    };

    const [filterVehicles, setFilterVehicles] = useState([]);
    const [status, setStatus] = useState([]);
    const [location, setLocation] = useState([]);
    const [sortType, setSortType] = useState('default');

    const toggleStatus = (e) => {
      if (status.includes(e.target.value)) {
        setStatus(prev=> prev.filter(item => item !== e.target.value));
      }
      else
        setStatus(prev=> [...prev, e.target.value]);
    }

    const toggleLocation = (e) => {
      if (location.includes(e.target.value)) {
        setLocation(prev=> prev.filter(item => item !== e.target.value));
      }
      else
        setLocation(prev=> [...prev, e.target.value]);
    }

        // First, initialize vehicles from vehicleData
    useEffect(() => {
      if (vehicleData) {
        setFilterVehicles(vehicleData); // Store the original data
        setAllVehicles(vehicleData);    // Set the displayed data
      }
    }, [vehicleData]);

    // Combined filter and sort function
    const applyFilterAndSort = () => {
      // Start with original data
      let processedVehicles = [...filterVehicles];
      
      // Apply filters
      if (status.length > 0) {
        processedVehicles = processedVehicles.filter(vehicle => status.includes(vehicle.status));
      }
      
      if (location.length > 0) {
        processedVehicles = processedVehicles.filter(vehicle => location.includes(vehicle.location));
      }
      
      // Apply sorting
      switch (sortType) {
        case 'high-low':
          processedVehicles.sort((a, b) => b.capacity - a.capacity);
          break;
        case 'low-high':
          processedVehicles.sort((a, b) => a.capacity - b.capacity);
          break;
        case 'new':
          processedVehicles.sort((a, b) => b.year - a.year);
          break;
        case 'old':
          processedVehicles.sort((a, b) => a.year - b.year);
          break;
        default:
          // No sorting
          break;
      }
      
      // Update displayed vehicles and reset to first page
      setAllVehicles(processedVehicles);
      setCurrentPage(1);
    }

    // Apply filtering and sorting when any relevant state changes
    useEffect(() => {
      applyFilterAndSort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, location, sortType, filterVehicles]);

    return (
      <div className='my-10 pt-16'>
        <div className='text-center py-4 text-3xl'>
          <Title text={'Vehicles'}/>
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-1'>
          <div className='min-w-60'>
            <p className='my-2 text-xl flex items-center gap-2'>Filters</p>
            <div className='border border-gray-300 pl-5 py-2 mt-2'>
              <p className='mb-3 text-sm font-medium'>Status</p>
              <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='Active' onChange={toggleStatus}/> Active
                </p>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='Inactive' onChange={toggleStatus}/> Inactive
                </p>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='In Repair' onChange={toggleStatus}/> In Repair
                </p>
              </div>
            </div>
            <div className='border border-gray-300 pl-5 py-2 mt-2'>
              <p className='mb-3 text-sm font-medium'>Location</p>
              <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='Cluj-Napoca' onChange={toggleLocation}/> Cluj-Napoca
                </p>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='Beclean' onChange={toggleLocation}/> Beclean
                </p>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='Arad' onChange={toggleLocation}/> Arad
                </p>
                <p className='flex gap-2'>
                  <input className='w-3' type='checkbox' value='Bucuresti' onChange={toggleLocation}/> Bucuresti
                </p>
              </div>
            </div>
          </div>
          <div className='flex-1'>
            <div className='flex justify-end items-center text-base mb-4 gap-4'>
              <select className='border-2 border-gray-300 px-2 py-1 rounded-md' onChange={(e) => setSortType(e.target.value)}>
                <option value="default">Sort by</option>
                <option value="high-low">Sort by: High to Low</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="new">Sort by: Newest</option>
                <option value="old">Sort by: Oldest</option>
              </select>

              {/* Add Button */}
              {/* <button
                  onClick={handleAddClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
              >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Vehicle
              </button> */}
            </div>

            {/* Pagination controls */}
          <div className="flex flex-wrap justify-between items-center mb-6 ml-4">
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
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 ml-4'>
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
                      capacity={item.capacity}  
                      year={item.year}
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
        </div>
      </div>
  )
}

export default Vehicles
