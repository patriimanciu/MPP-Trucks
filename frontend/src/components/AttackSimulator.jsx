import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AttackSimulator = ({ onSimulationComplete }) => {
  const [actionType, setActionType] = useState('create');
  const [count, setCount] = useState(15);
  const [loading, setLoading] = useState(false);
  const { getAuthHeaders } = useAuth();
  
  const simulateAttack = async () => {
    try {
      setLoading(true);
      console.log('Simulating attack with:', { actionType, count });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/security/simulate-attack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          actionType,
          count: parseInt(count)
        })
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response body:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to simulate attack');
      }
      
      toast.success(data.message || 'Attack simulation successful');
      
      if (onSimulationComplete) {
        setTimeout(onSimulationComplete, 2000);
      }
    } catch (error) {
      console.error('Error simulating attack:', error);
      toast.error(error.message || 'Failed to simulate attack');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <h3 className="text-lg font-medium text-yellow-800 mb-3">Simulate Attack (Testing Only)</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">Action Type</label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            className="w-full border border-yellow-300 rounded p-2 bg-white"
            disabled={loading}
          >
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-yellow-700 mb-1">Action Count</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min="1"
            max="100"
            className="w-full border border-yellow-300 rounded p-2"
            disabled={loading}
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={simulateAttack}
            disabled={loading}
            className={`w-full py-2 px-4 rounded ${
              loading
                ? 'bg-yellow-300 cursor-not-allowed'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            {loading ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>
      
      <p className="text-xs text-yellow-600">
        Note: This will create log entries and potentially trigger security alerts.
        Use only in test environments.
      </p>
    </div>
  );
};

export default AttackSimulator;