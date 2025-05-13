import React from 'react'
import Navbar from './components/Navbar'
import {Routes, Route} from 'react-router-dom'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Home from './pages/Home'
import AddDriver from './pages/AddDriver'
import EditDriver from './pages/EditDriver'
import {Toaster} from 'react-hot-toast'
import { useEffect, useState } from 'react';
import VehicleDetails from './pages/VehicleDetails';

const App = ({ children }) => {
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

    const interval = setInterval(checkServerStatus, 5000); // Check server status every 5 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    
    <div className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32'>
      <Navbar />
      {!isOnline && <div className="alert alert-warning">You are offline. Changes will be saved locally.</div>}
      {isOnline && !isServerReachable && <div className="alert alert-danger">Server is unreachable. Changes will sync when the server is back online.</div>}
      {children}
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/vehicles' element={<Vehicles/>}></Route>
        <Route path='/drivers' element={<Drivers/>}></Route>
        <Route path="/add-driver" element={<AddDriver />} />
        <Route path="/edit-driver/:id" element={<EditDriver />} />
        <Route path="/vehicles/:id/drivers" element={<VehicleDetails />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App