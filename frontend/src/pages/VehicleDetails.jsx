import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [assignedDrivers, setAssignedDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch vehicle details
        const vehicleResponse = await fetch(`/api/vehicles/${id}`);
        
        if (!vehicleResponse.ok) {
          throw new Error('Failed to fetch vehicle details');
        }
        
        const vehicleData = await vehicleResponse.json();
        setVehicle(vehicleData);
        
        // Fetch assigned drivers
        const driversResponse = await fetch(`/api/vehicles/${id}/drivers`);
        
        if (!driversResponse.ok) {
          throw new Error('Failed to fetch vehicle drivers');
        }
        
        const driversData = await driversResponse.json();
        console.log('Drivers data:', driversData);
        setAssignedDrivers(driversData);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        toast.error('Failed to load vehicle details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchVehicleDetails();
    }
  }, [id]);

  useEffect(() => {
    if (vehicle) {
      console.log('Vehicle data:', vehicle);
      console.log('Image path:', vehicle.image);
    }
  }, [vehicle]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (!vehicle) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium mb-4">Vehicle not found</h2>
        <button 
          onClick={() => navigate('/vehicles')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Vehicles
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <button 
        onClick={() => navigate('/vehicles')}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Vehicles
      </button>
      
      {/* Vehicle details section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
            {vehicle.image && vehicle.image.length > 0 ? (
              <img 
                src={vehicle.image[0]} 
                alt={`${vehicle.brand} ${vehicle.model}`} 
                className="w-full h-auto rounded-lg object-cover"
                onError={(e) => {
                    console.error("Image failed to load:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = '/assets/vehicle-placeholder.png';
                }}
                />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold mb-4">{vehicle.brand} {vehicle.model}</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">License Plate</p>
                <p className="font-medium">{vehicle.plate}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Year</p>
                <p className="font-medium">{vehicle.year}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    vehicle.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {vehicle.status}
                  </span>
                </p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-medium">{vehicle.location}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Capacity</p>
                <p className="font-medium">{vehicle.capacity || 'N/A'}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Fuel Type</p>
                <p className="font-medium">{vehicle.fuel || 'N/A'}</p>
              </div>
              
              {vehicle.mileage && (
                <div>
                  <p className="text-gray-600 text-sm">Mileage</p>
                  <p className="font-medium">{vehicle.mileage}</p>
                </div>
              )}
              
              {vehicle.maintenance && (
                <div>
                  <p className="text-gray-600 text-sm">Last Maintenance</p>
                  <p className="font-medium">{vehicle.maintenance}</p>
                </div>
              )}
              
              {vehicle.insurance && (
                <div>
                  <p className="text-gray-600 text-sm">Insurance Until</p>
                  <p className="font-medium">{vehicle.insurance}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Assigned Drivers section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        
        {assignedDrivers.length === 0 ? (
          <p className="text-gray-500">No drivers assigned to this vehicle</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedDrivers.map(driver => (
              <div key={driver._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center p-4">
                  {driver.image && driver.image.length > 0 ? (
                    <img 
                      src={driver.image[0]} 
                      alt={`${driver.name} ${driver.surname}`} 
                      className="w-16 h-16 rounded-full object-cover mr-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/people/placeholder.png';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="text-gray-500 text-lg font-bold">
                        {driver.name?.charAt(0)}{driver.surname?.charAt(0)}
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium">
                      {driver.name} {driver.surname}
                      {driver.isPrimary && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Primary
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{driver.phone}</p>
                    {driver.assignedDate && (
                      <p className="text-xs text-gray-500">
                        Assigned: {driver.assignedDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetails;