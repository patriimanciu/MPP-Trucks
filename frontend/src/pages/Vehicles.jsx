import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import VehicleItem from '../components/VehicleItem';

const Vehicles = () => {
  const [allVehicles, setAllVehicles] = useState([]);
  const [itemsPerPage] = useState(20); // Reasonable number per page
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [status, setStatus] = useState([]);
  const [location, setLocation] = useState([]);
  const [sortField, setSortField] = useState('brand');
  const [sortOrder, setSortOrder] = useState('asc');
  
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log("Fetching vehicles page", page);
        
        const params = new URLSearchParams();
        
        params.append('page', page);
        params.append('limit', itemsPerPage);
        
        params.append('sortBy', sortField);
        params.append('sortOrder', sortOrder);
        
        if (status.length > 0) {
          status.forEach(statusValue => {
            params.append('status', statusValue);
          });
        }
        
        if (location.length > 0) {
          location.forEach(locationValue => {
            params.append('location', locationValue);
          });
        }
        
        const url = `/api/vehicles${params.toString() ? '?' + params.toString() : ''}`;
        console.log("Fetching from URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Get total count
        const total = response.headers.get('X-Total-Count') || data.totalCount || 0;
        setTotalVehicles(parseInt(total, 10));
        setTotalPages(Math.ceil(parseInt(total, 10) / itemsPerPage));
        
        console.log("API response:", data);
        
        // Set vehicles for this page (don't accumulate)
        if (Array.isArray(data)) {
          setAllVehicles(data);
        } else if (data.vehicles && Array.isArray(data.vehicles)) {
          setAllVehicles(data.vehicles);
        } else {
          console.error("API didn't return an array:", data);
          setAllVehicles([]);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setAllVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [page, status, location, sortField, sortOrder, itemsPerPage]);
  
  useEffect(() => {
    setPage(1);
  }, [status, location, sortField, sortOrder]);

  const toggleStatus = (e) => {
    // Keep this code unchanged
    if (status.includes(e.target.value)) {
      setStatus((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setStatus((prev) => [...prev, e.target.value]);
    }
  };

  const toggleLocation = (e) => {
    // Keep this code unchanged
    if (location.includes(e.target.value)) {
      setLocation((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setLocation((prev) => [...prev, e.target.value]);
    }
  };

  // Add pagination navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="my-10 pt-16">
      <div className="text-center py-4 text-3xl">
        <Title text={'Vehicles'} />
      </div>
      
      {/* Total count display */}
      <div className="text-center mb-4">
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          Total vehicles: {totalVehicles}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-1">
        <div className="min-w-60">
          <p className="my-2 text-xl flex items-center gap-2">Filters</p>
          <div className="border border-gray-300 pl-5 py-2 mt-2">
            <p className="mb-3 text-sm font-medium">Status</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="Active" onChange={toggleStatus} /> Active
              </p>
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="Inactive" onChange={toggleStatus} /> Inactive
              </p>
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="In Repair" onChange={toggleStatus} /> In Repair
              </p>
            </div>
          </div>
          <div className="border border-gray-300 pl-5 py-2 mt-2">
            <p className="mb-3 text-sm font-medium">Location</p>
            <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="Cluj-Napoca" onChange={toggleLocation} /> Cluj-Napoca
              </p>
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="Beclean" onChange={toggleLocation} /> Beclean
              </p>
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="Arad" onChange={toggleLocation} /> Arad
              </p>
              <p className="flex gap-2">
                <input className="w-3" type="checkbox" value="Bucuresti" onChange={toggleLocation} /> Bucuresti
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-end items-center text-base mb-4 gap-4">
            <select
              className="border-2 border-gray-300 px-2 py-1 rounded-md"
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortField(field);
                setSortOrder(order);
              }}
            >
              <option value="id-asc">Sort by: Default</option>
              <option value="capacity-desc">Sort by: Capacity (High to Low)</option>
              <option value="capacity-asc">Sort by: Capacity (Low to High)</option>
              <option value="year-desc">Sort by: Year (Newest)</option>
              <option value="year-asc">Sort by: Year (Oldest)</option>
            </select>
          </div>
          
          {/* Rendering Vehicles - simplified without ref */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 ml-4">
            {allVehicles.map((item, index) => (
              <VehicleItem 
                key={index}
                id={item._id || item.id}
                image={Array.isArray(item.image) ? item.image : []} 
                plate={item.plate || ''}
                brand={item.brand || ''}
                model={item.model || ''}
                status={item.status || ''}
                capacity={item.capacity || ''}
                year={item.year || ''}
                location={item.location || ''}
                assignedTo={item.assignedTo || 'Unavailable'}
                borderColor={item.borderColor}
              />
            ))}
          </div>
          
          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center mt-4 mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {/* Add traditional pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-l border ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                
                <div className="flex">
                  {/* First page */}
                  {page > 2 && (
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-3 py-1 border-t border-b bg-white hover:bg-gray-50"
                    >
                      1
                    </button>
                  )}
                  
                  {/* Ellipsis */}
                  {page > 3 && (
                    <span className="px-3 py-1 border-t border-b">…</span>
                  )}
                  
                  {/* Previous page */}
                  {page > 1 && (
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      className="px-3 py-1 border-t border-b bg-white hover:bg-gray-50"
                    >
                      {page - 1}
                    </button>
                  )}
                  
                  {/* Current page */}
                  <button
                    className="px-3 py-1 border-t border-b bg-blue-50 text-blue-600 font-medium"
                  >
                    {page}
                  </button>
                  
                  {/* Next page */}
                  {page < totalPages && (
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      className="px-3 py-1 border-t border-b bg-white hover:bg-gray-50"
                    >
                      {page + 1}
                    </button>
                  )}
                  
                  {/* Ellipsis */}
                  {page < totalPages - 2 && (
                    <span className="px-3 py-1 border-t border-b">…</span>
                  )}
                  
                  {/* Last page */}
                  {page < totalPages - 1 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 border-t border-b bg-white hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 rounded-r border ${page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Vehicles;