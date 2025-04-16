import React from 'react'
import { useContext, useState, useEffect } from 'react'
import { DriversContext } from '../context/DriversContext'
import Title from './Title'
import { toast } from 'react-hot-toast'
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const DriversCollection = ({ onAdd, onEdit }) => {
    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
          case 'free': return 'bg-green-100 text-green-800';
          case 'assigned': return 'bg-red-100 text-red-800';
          default: return 'bg-gray-100 text-gray-800';
        }
      };

    const { setDrivers } = useContext(DriversContext);
    const [allDrivers, setAllDrivers] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [statusChartData, setStatusChartData] = useState({
        labels: [],
        datasets: [
          {
            label: 'Driver Status',
            data: [],
            backgroundColor: [],
          },
        ],
      });
      
      const [driversOverTimeData, setDriversOverTimeData] = useState({
        labels: [],
        datasets: [
          {
            label: 'Drivers Added Over Time',
            data: [],
            borderColor: '#FF9800',
            fill: false,
          },
        ],
      });

      const [ageGroupChartData, setAgeGroupChartData] = useState({
        labels: ['<25', '26-44', '45+'],
        datasets: [
          {
            label: 'Age Groups',
            data: [0, 0, 0],
            backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
          },
        ],
      });

      useEffect(() => {
        const fetchDrivers = async () => {
          console.log('Fetching drivers...');
          if (!navigator.onLine) {
            console.log('App is offline. Attempting to load cached drivers...');
            const cachedDrivers = JSON.parse(localStorage.getItem('drivers'));
            if (cachedDrivers) {
              console.log('Loaded drivers from cache:', cachedDrivers);
              setDrivers(cachedDrivers);
              setAllDrivers(cachedDrivers);
              toast.success('Loaded drivers from offline cache.');
            } else {
              console.error('No drivers available offline.');
              toast.error('No drivers available offline.');
            }
            return;
          }
      
          try {
            const response = await fetch('/api/drivers');
            if (!response.ok) {
              throw new Error('Failed to fetch drivers');
            }
            const drivers = await response.json();
            console.log('Fetched drivers from API:', drivers);
            setDrivers(drivers);
            setAllDrivers(drivers);
      
            localStorage.setItem('drivers', JSON.stringify(drivers));
          } catch (error) {
            console.error('Error fetching drivers:', error);
      
            const cachedDrivers = JSON.parse(localStorage.getItem('drivers'));
            if (cachedDrivers) {
              console.log('Loaded drivers from cache after API failure:', cachedDrivers);
              setDrivers(cachedDrivers);
              setAllDrivers(cachedDrivers);
              toast.success('Loaded drivers from offline cache.');
            } else {
              toast.error('No drivers available offline.');
            }
          }
        };
      
        fetchDrivers();
      }, [setDrivers]);

      useEffect(() => {
        const ws = new WebSocket(`ws://${window.location.hostname}:5001`);
      
        ws.onopen = () => {
          console.log('WebSocket connection established');
        };
      
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
        
          if (message.type === 'NEW_DRIVER') {
            const newDriver = message.payload;
            console.log('New driver received:', newDriver);
        
            if (!navigator.onLine) {
              console.log('App is offline. Queuing WebSocket update.');
              const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
              queuedOperations.push({ type: 'ADD', payload: newDriver });
              localStorage.setItem('queuedOperations', JSON.stringify(queuedOperations));
              return;
            }
        
            setAllDrivers((prevDrivers) => {
              const updatedDrivers = [...prevDrivers, newDriver];
              localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
              return updatedDrivers;
            });
        
            generateStatusChartData([...allDrivers, newDriver]);
            generateDriversOverTimeData([...allDrivers, newDriver]);
            generateAgeGroupChartData([...allDrivers, newDriver]);
        
            toast.success(`New driver added: ${newDriver.name} ${newDriver.surname}`);
          }
        };
      
        ws.onclose = () => {
          console.log('WebSocket connection closed');
        };
      
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      
        return () => {
          ws.close();
          console.log('WebSocket connection cleaned up');
        };
      }, [allDrivers]);

      useEffect(() => {
        if (allDrivers.length > 0) {
          generateStatusChartData(allDrivers);
          generateDriversOverTimeData(allDrivers);
          generateAgeGroupChartData(allDrivers);
        }
      }, [allDrivers]);

      useEffect(() => {
        const syncQueuedOperations = async () => {
          if (navigator.onLine) {
            console.log('App is back online. Syncing queued operations...');
            const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
      
            for (const operation of queuedOperations) {
              try {
                if (operation.type === 'CREATE') {
                  console.log('Syncing CREATE operation:', operation);
      
                  const response = await fetch('/api/drivers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(operation.payload),
                  });
      
                  if (!response.ok) {
                    throw new Error(`Failed to sync CREATE operation`);
                  }
      
                  const addedDriver = await response.json();
                  console.log('Driver added by backend:', addedDriver);
      
                  setAllDrivers((prevDrivers) => {
                    const updatedDrivers = [...prevDrivers, addedDriver];
                    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
                    return updatedDrivers;
                  });
                } else if (operation.type === 'DELETE') {
                  console.log('Syncing DELETE operation:', operation.id);
      
                  const response = await fetch(`/api/drivers/${operation.id}`, {
                    method: 'DELETE',
                  });
      
                  if (!response.ok) {
                    throw new Error(`Failed to sync DELETE operation: ${response.statusText}`);
                  }
      
                  setAllDrivers((prevDrivers) => {
                    const updatedDrivers = prevDrivers.filter((driver) => driver._id !== operation.id);
                    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
                    return updatedDrivers;
                  });
                }
              } catch (error) {
                console.error('Error syncing operation:', error);
              }
            }
      
            localStorage.removeItem('queuedOperations');
            toast.success('Queued operations synced successfully.');
          }
        };
      
        window.addEventListener('online', syncQueuedOperations);
      
        return () => {
          window.removeEventListener('online', syncQueuedOperations);
        };
      }, []);
    
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

    const handleDelete = async (driverId) => {
      const driverToDelete = allDrivers.find((driver) => driver._id === driverId);
    
      if (window.confirm('Are you sure you want to delete this driver?')) {
        if (!navigator.onLine) {
          console.log('Offline. Queuing DELETE operation.');
          const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
          queuedOperations.push({
            type: 'DELETE',
            id: driverId,
          });
          localStorage.setItem('queuedOperations', JSON.stringify(queuedOperations));
          console.log('After queuing DELETE operation:', JSON.parse(localStorage.getItem('queuedOperations')));
    
          // Update local state to remove the driver
          const updatedDrivers = allDrivers.filter((driver) => driver._id !== driverId);
          setDrivers(updatedDrivers);
          setAllDrivers(updatedDrivers);
    
          toast.success('Driver deleted locally. Changes will sync when back online.');
          return;
        }
    
        try {
          const response = await fetch(`/api/drivers/${driverId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            throw new Error('Failed to delete driver');
          }
    
          toast.success(`${driverToDelete.name} ${driverToDelete.surname} was deleted successfully`);
    
          const updatedDrivers = allDrivers.filter((driver) => driver._id !== driverId);
          setDrivers(updatedDrivers);
          setAllDrivers(updatedDrivers);
        } catch (error) {
          console.error('Error deleting driver:', error);
          toast.error('Failed to delete driver');
        }
      }
    };

    const generateStatusChartData = (drivers) => {
        const freeDrivers = drivers.filter((driver) => driver.assigned === 'Free').length;
        const assignedDrivers = drivers.filter((driver) => driver.assigned === 'Assigned').length;
        const onLeaveDrivers = drivers.filter((driver) => driver.assigned === 'On Leave').length;
    
        setStatusChartData({
          labels: ['Free', 'Assigned', 'On Leave'],
          datasets: [
            {
              label: 'Driver Status',
              data: [freeDrivers, assignedDrivers, onLeaveDrivers],
              backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
              hoverBackgroundColor: ['#45a049', '#e53935', '#fb8c00'],
            },
          ],
        });
      };

      const generateDriversOverTimeData = (drivers) => {
        if (!drivers || drivers.length === 0) {
          setDriversOverTimeData({
            labels: [],
            datasets: [
              {
                label: 'Drivers Added Over Time',
                data: [],
                borderColor: '#FF9800',
                fill: false,
              },
            ],
          });
          return;
        }
      
        const groupedByYear = drivers.reduce((acc, driver) => {
          const year = driver.dateOfHiring ? new Date(driver.dateOfHiring).getFullYear() : 'Unknown';
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {});

        const years = Object.keys(groupedByYear).map(Number).filter(year => !isNaN(year));
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const allYears = Array.from({ length: maxYear - minYear + 1 }, (_, i) => (minYear + i).toString());
      
        const labels = allYears.map((year) => year.toString());
        const data = labels.map((year) => groupedByYear[year] || 0);
      
        setDriversOverTimeData({
          labels,
          datasets: [
            {
              label: 'Drivers Added Over Time',
              data,
              borderColor: '#FF9800',
              fill: false,
            },
          ],
        });
      };

      const generateAgeGroupChartData = (drivers) => {
        if (!drivers || drivers.length === 0) {
          setAgeGroupChartData({
            labels: ['<25', '26-44', '45+'],
            datasets: [
              {
                label: 'Age Groups',
                data: [0, 0, 0],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
              },
            ],
          });
          return;
        }
      
        const currentYear = new Date().getFullYear();
      
        const ageGroups = drivers.reduce(
          (acc, driver) => {
            const birthYear = driver.dateOfBirth ? new Date(driver.dateOfBirth).getFullYear() : null;
            if (birthYear) {
              const age = currentYear - birthYear;
              if (age < 25) acc['<25'] += 1;
              else if (age >= 25 && age <= 44) acc['26-44'] += 1;
              else acc['45+'] += 1;
            }
            return acc;
          },
          { '<25': 0, '26-44': 0, '45+': 0 }
        );
      
        setAgeGroupChartData({
          labels: ['<25', '26-44', '45+'],
          datasets: [
            {
              label: 'Age Groups',
              data: [ageGroups['<25'], ageGroups['26-44'], ageGroups['45+']],
              backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
            },
          ],
        });
      };

    if (!allDrivers || !Array.isArray(allDrivers)) {
        return <div>Loading drivers data...</div>
    }

    return (
        <div className='my-10 pt-16'>
            <div className='text-center py-4 text-3xl'>
                <Title text={'Drivers'}/>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {/* Driver Status Distribution */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Driver Status Distribution</h3>
                    <Pie data={statusChartData} />
                </div>
                
                {/* Drivers Added Over Time */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Drivers Added Over Time</h3>
                    <Line data={driversOverTimeData} />
                </div>

                {/* Age Group Distribution */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Employee Age Groups</h3>
                    {ageGroupChartData.datasets[0].data.length > 0 ? (
                        <Pie data={ageGroupChartData} />
                    ) : (
                        <p className="text-gray-500">No data available for this chart.</p>
                    )}
                </div>
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
                                        onClick={() => onEdit(driver._id)}
                                        className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-md mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(driver._id)}
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