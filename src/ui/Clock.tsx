import React from 'react'

import strftime from 'strftime'

import Information from './Information'

export default function Clock() {
  return (
    <Information>
      { strftime('%Y-%m-%d (%a) %H:%M') }
    </Information>
  )
}
