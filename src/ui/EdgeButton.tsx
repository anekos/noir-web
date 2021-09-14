import React from 'react'

import classNames from 'classnames'


export default function EdgeButton({extraClass, onClick, visible}) {
  if (!visible)
    return (<></>)
  // <button class="transition duration-500 ease-in-out bg-blue-600 hover:bg-red-600 transform hover:-translate-y-1 hover:scale-110 ...">
  return (
    <div
      className={classNames('absolute bg-green-300 z-50 rounded-md edge-button cursor-pointer', extraClass)}
      onClick={onClick}
    />
  )
}
