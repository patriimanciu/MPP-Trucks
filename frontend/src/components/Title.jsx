import React from 'react'

const Title = ({text}) => {
  return (
    <div className='inline-flex gao-2 items-center mb-2 mt-6'>
        <p className='text-gray-700 font-medium'>{text}</p>
        <p className='w-8 h-[1px] bg-gray-700'></p>
    </div>
  )
}

export default Title
