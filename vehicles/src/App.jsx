import React from 'react'
import Navbar from './components/Navbar'
import Header from './components/Header'
import {Routes, Route} from 'react-router-dom'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Home from './pages/Home'
import AddDriver from './pages/AddDriver'
import EditDriver from './pages/EditDriver'
import {Toaster} from 'react-hot-toast'

const App = () => {
  return (
    <div className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 2xl:px-32'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/vehicles' element={<Vehicles/>}></Route>
        <Route path='/drivers' element={<Drivers/>}></Route>
        <Route path="/add-driver" element={<AddDriver />} />
        <Route path="/edit-driver/:id" element={<EditDriver />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App