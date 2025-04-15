import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import VehicleItem from '../components/VehicleItem';

const Vehicles = () => {
  const [allVehicles, setAllVehicles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [status, setStatus] = useState([]);
  const [location, setLocation] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [totalPages, setTotalPages] = useState(1);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/ping');
        setIsServerReachable(response.ok);
      } catch {
        setIsServerReachable(false);
      }
    };

    const interval = setInterval(checkServerStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const toggleStatus = (e) => {
    if (status.includes(e.target.value)) {
      setStatus((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setStatus((prev) => [...prev, e.target.value]);
    }
  };

  const toggleLocation = (e) => {
    if (location.includes(e.target.value)) {
      setLocation((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setLocation((prev) => [...prev, e.target.value]);
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const queryParams = new URLSearchParams({
          status: status.join(','),
          location: location.join(','),
          sortField,
          sortOrder,
          page: currentPage,
          limit: itemsPerPage,
        });
  
        const response = await fetch(`/api/vehicles?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
  
        const data = await response.json();
        setAllVehicles(data.vehicles);
        setTotalPages(Math.ceil(data.total / itemsPerPage));
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };
  
    fetchVehicles();
  }, [status, location, sortField, sortOrder, currentPage, itemsPerPage]);

  return (
    <div className="my-10 pt-16">
      {!isOnline && <div className="alert alert-warning">You are offline. Changes will be saved locally.</div>}
      {isOnline && !isServerReachable && <div className="alert alert-danger">Server is unreachable. Changes will sync when the server is back online.</div>}
      <div className="text-center py-4 text-3xl">
        <Title text={'Vehicles'} />
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

          {/* Pagination controls */}
          <div className="flex flex-wrap justify-between items-center mb-6 ml-4">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border rounded p-1 text-sm"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={16}>16</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, allVehicles.length)} of {allVehicles.length} vehicles
            </div>
          </div>

          {/* Rendering Vehicles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 ml-4">
            {allVehicles.map((item, index) => (
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
              />
            ))}
          </div>

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l border ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>

                <div className="flex">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border-t border-b ${
                        currentPage === i + 1 ? 'bg-blue-50 text-blue-600 font-medium' : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r border ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50'
                  }`}
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