import React from 'react'
import { Link } from 'react-router-dom'

const DriverItem = ({name, surname, image, phone}) => {


  return (
    <Link className='text-gray-700 cursor-pointer block border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all p-4 bg-white hover:border-gray-300' to={`/driver/${name}`}>
        <div className='overflow-hidden'>
            <img className='hover:scale-110 transition ease-in-out' src={image[0]}></img>
        </div>
        <p className='pt-3 pb-1 text-sm font-medium'>{name} {surname}</p>
        <p className='text-sm'>{phone}</p>
      
    </Link>
  )
}

export default DriverItem
