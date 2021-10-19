import React from 'react'


export default function PanelFrame({children}) {
  return (
    <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center overflow-y-auto max-h-screen">
      <div className="flex flex-row items-center w-full p-2">
        { children }
      </div>
    </div>
  )
}
