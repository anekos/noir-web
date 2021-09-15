import React from 'react'

import strftime from 'strftime'

import Information from './Information'


export default function Clock() {
  return (
    <Information className="absolute right-0 bottom-0 ">
      { strftime('%Y-%m-%d (%a) %H:%M') }
    </Information>
  )
}
