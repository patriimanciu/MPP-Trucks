import React from 'react'
import { Link } from 'react-router-dom'

const VehicleItem = ({id ,plate, brand, model, status, location, assignedTo, image, capacity, year}) => {
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBorderColor = (capacity) => {
    if (capacity < 1025) return 'border-red-500';
    if (capacity <= 1075) return 'border-yellow-500';
    return 'border-green-500';
  };

  return (
    <Link className={`border-2 p-4 rounded ${getBorderColor(capacity)}`} to={`/vehicles/${id}/drivers`}>        <h3 className='font-medium text-lg text-gray-800 text-right'>{plate}</h3>
        <div className='overflow-hidden'>
            <img className='hover:scale-110 transition ease-in-out' src={image[0]}></img>
        </div>
        <h3 className='font-medium text-lg text-gray-800'>{brand} {model}</h3>
        <div className='mt-2 flex items-center'>
          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`} style={{ width: '80px' }}>
            {status}
          </span>
        </div>
        <p className='text-sm'>{location}</p>
        <p className='text-sm'>{assignedTo}</p>
        <p className='text-sm'>Capacity: {capacity}</p>
        <p className='text-sm'>Year: {year}</p>
    </Link>
  )
}

export default VehicleItem
