import React from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'


export default function Loading() {
  return (
    <FontAwesomeIcon
      className="text-white"
      icon={faSpinner}
      size="6x"
      spin
    />
  )
}
