import React, {FC, ButtonHTMLAttributes} from 'react'

import classNames from 'classnames'

type IButton = {
} & ButtonHTMLAttributes<HTMLButtonElement>
  export const Button: FC<IButton> = ({children, className, ...props}) => {
  return (
    <button
      className={classNames('rounded-md p-2 bg-green-500 text-white font-bold mx-1', className)}
      {...props}
    >
      { children }
    </button>
  )
}
