import React from 'react'

import classNames from 'classnames'


export default function EdgeButton({extraClass, onClick, visible}) {
  if (!visible)
    return (<></>)
  return (
    <div
      className={classNames('absolute bg-green-300 z-50 rounded-md opacity-0 hover:opacity-80', extraClass)}
      onClick={onClick}
    />
  )
}
