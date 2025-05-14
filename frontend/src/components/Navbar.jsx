import React from 'react'
import { assets } from '../../public/assets/assets'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  return (
    <div className='absolute top-0 left-0 w-full z-10 bg-white/60 backdrop-blur-md shadow-md' id='Navbar'>
        <div className='container mx-auto flex justify-between items-center py-4 px-6 md:px-20 lg:px-32 bg-transparent'>
            <img src={assets.logo_black} className='h-10 md:h-12'/>
            <ul className='flex space-x-6 text-gray-700 font-medium'>
                <NavLink to='/' className='cursor-pointer hover:text-gray-400'>Home</NavLink>
                <NavLink to='/vehicles' className='cursor-pointer hover:text-gray-400'>Vehicles</NavLink>
                <NavLink to='/drivers' className='cursor-pointer hover:text-gray-400'>Drivers</NavLink>
            </ul>
            <div className="flex items-center ml-auto">
              {currentUser ? (
                <>
                  <span className="mr-4 text-sm text-gray-600">
                    Welcome, {currentUser.first_name}
                  </span>
                  
                  {isAdmin && isAdmin() && (
                    <Link to="/admin" className="mr-4 text-blue-600 hover:text-blue-800">
                      Admin
                    </Link>
                  )}
                  
                  <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mr-4">
                    Login
                  </Link>
                  <Link to="/register">
                    Register
                  </Link>
                </>
              )}
            </div>
        </div>
      
    </div>
  )
}

export default Navbar