import React from 'react'

import classNames from 'classnames'

const DefaultClassName = "m-2 rounded-md p-2 z-50 bg-gray-500 opacity-50 hover:opacity-90 text-white"


export default function Information({children, className}) {
  return (
    <div className={classNames(DefaultClassName, className)}>
      { children }
    </div>
  )
}

