import React, { useEffect, useState } from 'react';
import Title from '../components/Title';
import VehicleItem from '../components/VehicleItem';

const Vehicles = () => {
  const [allVehicles, setAllVehicles] = useState([]);
  const [displayedVehicles, setDisplayedVehicles] = useState([]);
  const [itemsPerPage] = useState(8);
  const [status, setStatus] = useState([]);
  const [location, setLocation] = useState([]);
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }
        const data = await response.json();
        setAllVehicles(data.vehicles);
        setDisplayedVehicles(data.vehicles.slice(0, itemsPerPage));
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles();
  }, [itemsPerPage]);

  useEffect(() => {
    let filtered = [...allVehicles];

    if (status.length > 0) {
      filtered = filtered.filter((vehicle) => status.includes(vehicle.status));
    }

    if (location.length > 0) {
      filtered = filtered.filter((vehicle) => location.includes(vehicle.location));
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortField] > b[sortField] ? 1 : -1;
      } else {
        return a[sortField] < b[sortField] ? 1 : -1;
      }
    });

    setDisplayedVehicles(filtered.slice(0, itemsPerPage));
  }, [status, location, sortField, sortOrder, allVehicles, itemsPerPage]);

  const loadMoreVehicles = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    setTimeout(() => {
      const nextVehicles = allVehicles.slice(0, itemsPerPage);
      setDisplayedVehicles((prevVehicles) => [...prevVehicles, ...nextVehicles]);
      setIsLoadingMore(false);
    }, 500); 
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore) {
          loadMoreVehicles();
        }
      },
      { threshold: 1.0 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [isLoadingMore, allVehicles]);

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

  return (
    <div className="my-10 pt-16">
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

          {/* Rendering Vehicles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 gap-y-6 ml-4">
            {displayedVehicles.map((item, index) => (
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

          <div id="scroll-sentinel" className="h-10"></div>
          {isLoadingMore && <div className="text-center">Loading more vehicles...</div>}
        </div>
      </div>
    </div>
  );
};

export default Vehicles;