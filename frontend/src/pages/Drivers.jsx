import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import DriversCollection from '../components/DriversCollection'

const Drivers = () => {
  const navigate = useNavigate();
  const [isServerReachable, setIsServerReachable] = useState(true);
  const handleAddDriver = () => {
    navigate('/add-driver');
  };

  const handleEditDriver = (driverId) => {
    navigate(`/edit-driver/${driverId}`);
  };

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/ping');
        const serverIsReachable = response.ok;
        setIsServerReachable(serverIsReachable);
    
        if (serverIsReachable) {
          console.log('Server is reachable. Syncing queued operations...');
          const queuedOperations = JSON.parse(localStorage.getItem('queuedOperations')) || [];
          const remainingOperations = [];
    
          for (const operation of queuedOperations) {
            try {
              if (operation.type === 'UPDATE') {
                console.log('Syncing UPDATE operation:', operation);
                const response = await fetch(`http://localhost:5001/api/drivers/${operation.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(operation.payload),
                });
    
                if (!response.ok) {
                  throw new Error('Failed to sync UPDATE operation');
                }
              } else if (operation.type === 'CREATE') {
                console.log('Syncing CREATE operation:', operation);
                const response = await fetch('http://localhost:5001/api/drivers', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(operation.payload),
                });
    
                if (!response.ok) {
                  throw new Error('Failed to sync CREATE operation');
                }
              } else if (operation.type === 'DELETE') {
                console.log('Syncing DELETE operation:', operation);
                const response = await fetch(`http://localhost:5001/api/drivers/${operation.id}`, {
                  method: 'DELETE',
                });
    
                if (!response.ok) {
                  throw new Error('Failed to sync DELETE operation');
                }
              }

            } catch (error) {
              console.error('Error syncing operation:', error);
              // Add the failed operation back to the remaining operations
              remainingOperations.push(operation);
            }
          }
    
          // Update localStorage with remaining operations
          if (remainingOperations.length > 0) {
            localStorage.setItem('queuedOperations', JSON.stringify(remainingOperations));
            console.log('Updated queued operations in localStorage:', remainingOperations);
          } else {
            localStorage.removeItem('queuedOperations'); // Clear the queue if all operations are synced
            console.log('Cleared queued operations from localStorage.');
          }
        }
      } catch (error) {
        console.error('Error checking server status:', error);
        setIsServerReachable(false);
      }
    };
  
    const interval = setInterval(checkServerStatus, 5000);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {!isServerReachable && (
        <div className="alert alert-warning">
          Server is unreachable. Changes will sync when the server is back online.
        </div>
      )}
      <DriversCollection onAdd={handleAddDriver} onEdit={handleEditDriver} />
    </div>
  )
}

export default Drivers
