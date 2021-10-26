import React, { ButtonHTMLAttributes } from 'react'

import classNames from 'classnames'


const ButtonClass = 'rounded-md p-2 bg-green-500 text-white font-bold mx-1'


interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
}
export function Button({children, className, ...props}: IButton) {
  return (
    <button
      className={classNames(ButtonClass, className)}
      {...props}
    >
      { children }
    </button>
  )
}

interface ICheckBox {
  caption: string
  value: boolean
  setter: (x: boolean) => void
  className?: string
}
export function CheckBox({caption, value, setter, className}: ICheckBox) {
  function onClickToggle(setter: (x: boolean) => void) {
    return function () {
      setter(!value)
    }
  }

  return (
    <div className={classNames(ButtonClass, "cursor-pointer", className || '')} onClick={onClickToggle(setter)}>
      <input type="checkbox" className="mr-1" checked={value} onChange={_ => null} />
      <label className="cursor-pointer">{caption}</label>
    </div>

  )
}
