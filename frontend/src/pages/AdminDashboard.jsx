import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');
  
  const { getAuthHeaders } = useAuth();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (activeTab === 'logs') {
          const response = await fetch('/api/users/all-logs', {
            headers: {
              ...getAuthHeaders(),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setLogs(data);
          }
        } else if (activeTab === 'users') {
          const response = await fetch('/api/users', {
            headers: {
              ...getAuthHeaders(),
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, getAuthHeaders]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`py-2 px-4 ${
                activeTab === 'logs'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('logs')}
            >
              Activity Logs
            </button>
            <button
              className={`ml-8 py-2 px-4 ${
                activeTab === 'users'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </nav>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : activeTab === 'logs' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.user_email || `User #${log.user_id}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${log.action === 'create' ? 'bg-green-100 text-green-800' : 
                        log.action === 'update' ? 'bg-blue-100 text-blue-800' : 
                        log.action === 'delete' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.entity_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.entity_id || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;