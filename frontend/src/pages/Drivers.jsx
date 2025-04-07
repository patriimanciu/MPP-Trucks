import React from 'react'
import { useNavigate } from 'react-router-dom';
import DriversCollection from '../components/DriversCollection'

const Drivers = () => {
  const navigate = useNavigate();
  const handleAddDriver = () => {
    navigate('/add-driver');
  };

  const handleEditDriver = (driverId) => {
    navigate(`/edit-driver/${driverId}`);
  };

  return (
    <div>
        <DriversCollection onAdd={handleAddDriver} onEdit={handleEditDriver}/>
    </div>
  )
}

export default Drivers
