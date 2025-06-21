import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setToken(token);
      setCurrentUser(JSON.parse(user));
    }
    
    setLoading(false);
  }, []);
  
  // Register a new user
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      
      toast.success('Registration successful! Please log in.');
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Login user (step 1: check credentials, send OTP)
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      if (data.requires2FA) {
        // Step 1 complete, OTP sent
        return { requires2FA: true };
      }
      // If backend ever returns token directly (shouldn't in this flow)
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info('You have been logged out');
  };
  
  // Check if user is admin
  const isAdmin = () => {
    return currentUser?.role === 'admin';
  };
  
  // Get authentication headers for API calls
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  const value = {
    currentUser,
    loading,
    register,
    login,
    verifyOtp,
    logout,
    isAdmin,
    getAuthHeaders,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
};