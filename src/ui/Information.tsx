import React from 'react'


export default function Information({children}) {
  return (
    <div className="absolute right-0 bottom-0 m-2 rounded-md p-2 z-50 bg-gray-500 opacity-50 hover:opacity-90 text-bold text-white">
      { children }
    </div>
  )
}

