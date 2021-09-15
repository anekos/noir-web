import React from 'react'

import Information from './Information'


interface IPosition {
  current: number
  last: number
}
export default function Position({current, last}: IPosition) {
  return (
    <div className="absolute bottom-0 flex items-center justify-center w-screen">
      <Information className="font-bold">
        { current } / { last }
      </Information>
    </div>
  )
}
