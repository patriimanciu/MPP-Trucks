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
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './pages/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/ping`);
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
    <AuthProvider>
      <div className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32'>
        <Navbar />
        {!isOnline && <div className="alert alert-warning">You are offline. Changes will be saved locally.</div>}
        {isOnline && !isServerReachable && <div className="alert alert-danger">Server is unreachable. Changes will sync when the server is back online.</div>}
        {children}
        <Routes>
          {/* Authentication routes */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/admin' element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
  
          {/* Protected application routes */}
          <Route path='/' element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path='/vehicles' element={
            <ProtectedRoute>
              <Vehicles />
            </ProtectedRoute>
          } />
          <Route path='/drivers' element={
            <ProtectedRoute>
              <Drivers />
            </ProtectedRoute>
          } />
          <Route path="/add-driver" element={
            <ProtectedRoute>
              <AddDriver />
            </ProtectedRoute>
          } />
          <Route path="/edit-driver/:id" element={
            <ProtectedRoute>
              <EditDriver />
            </ProtectedRoute>
          } />
          <Route path="/vehicles/:id/drivers" element={
            <ProtectedRoute>
              <VehicleDetails />
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  )
}

export default App