import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const FleetStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState([]);
  const [executionTime, setExecutionTime] = useState(null);
  
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/statistics/fleet/by-brand`);
        const data = await response.json();
        
        setStatistics(data.statistics);
        setExecutionTime(data.executionTimeMs);
      } catch (error) {
        console.error('Error fetching fleet statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }
  
  // Prepare chart data for vehicles by brand
  const chartData = {
    labels: statistics.map(item => item.brand),
    datasets: [
      {
        label: 'Total Vehicles',
        data: statistics.map(item => item.total_vehicles),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Active Vehicles',
        data: statistics.map(item => item.active_vehicles),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Maintenance Vehicles',
        data: statistics.map(item => item.maintenance_vehicles),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  // Prepare pie chart data for total vehicle distribution
  const pieData = {
    labels: statistics.map(item => item.brand),
    datasets: [
      {
        data: statistics.map(item => item.total_vehicles),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F8961E'
        ]
      }
    ]
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Fleet Statistics Dashboard</h1>
      
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Query Performance</h2>
          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
            {executionTime}ms execution time
          </span>
        </div>
        <p className="text-gray-600">
          This complex query joins multiple tables and performs aggregations across {statistics.reduce((sum, item) => sum + parseInt(item.total_vehicles), 0)} vehicles 
          and their assigned drivers. The execution time represents server-side processing only.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Vehicle Distribution by Brand</h2>
          <div className="h-80">
            <Bar 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Fleet Composition</h2>
          <div className="h-80">
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b">Detailed Statistics by Brand</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Brand</th>
                <th className="px-4 py-2 text-right">Total Vehicles</th>
                <th className="px-4 py-2 text-right">Assigned Drivers</th>
                <th className="px-4 py-2 text-right">Avg Vehicle Age</th>
                <th className="px-4 py-2 text-right">Avg Driver Salary</th>
                <th className="px-4 py-2 text-left">Top Locations</th>
              </tr>
            </thead>
            <tbody>
              {statistics.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium">{item.brand}</td>
                  <td className="px-4 py-3 text-right">{item.total_vehicles}</td>
                  <td className="px-4 py-3 text-right">{item.assigned_drivers}</td>
                  <td className="px-4 py-3 text-right">{item.avg_vehicle_age} years</td>
                  <td className="px-4 py-3 text-right">{item.avg_driver_salary} RON</td>
                  <td className="px-4 py-3 text-sm">{item.top_locations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetStatistics;