import React from 'react'
import DriversCollection from '../components/DriversCollection'

const Home = () => {
  return (
    <div className='min-h-screen mb-4 bg-cover bg-center flex items-center w-full overflow-hidden' style={{backgroundImage: `url('/background.jpeg')`}} id='Header'>
        <div className='container mx-auto text-white text-center py-4 px-6 md:px-20 lg:px-32'>
            <h2 className='text-5xl inline-block max-w-3xl dont-semibold'>Welcome back, John!</h2>
        </div>
    </div>
    // have section for current best drivers and vehicles in the future

  )
}

export default Home
