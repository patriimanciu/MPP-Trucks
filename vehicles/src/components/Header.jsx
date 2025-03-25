import React from 'react'
import Navbar from './Navbar'

const Header = () => {
  return (
    <div className='min-h-screen mb-4 bg-cover bg-center flex items-center w-full overflow-hidden' style={{backgroundImage: `url('/background.jpeg')`}} id='Header'>
      <Navbar />
        <div className='container mx-auto text-white text-center py-4 px-6 md:px-20 lg:px-32'>
            <h2 className='text-5xl inline-block max-w-3xl dont-semibold'>Welcome back, John!</h2>
            <div className='space-x-6 mt-16'>
                <a href="#Drivers" className='border border-white px-8 py-3 rounded'>Drivers</a>
                <a href="#Vehicles" className='border border-white px-8 py-3 rounded'>Vehicles</a>
            </div>
        </div>
    </div>
  )
}

export default Header
