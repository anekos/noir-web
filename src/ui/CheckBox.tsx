import classNames from 'classnames'


interface ICheckBox {
  caption: string
  value: boolean
  setter: (x: boolean) => void
  className?: string
}
export default function CheckBox({caption, value, setter, className}: ICheckBox) {
  function onClickToggle(setter: (x: boolean) => void) {
    return function () {
      setter(!value)
    }
  }

  return (
    <div className={classNames("rounded-md bg-green-500 p-2 mr-2 cursor-pointer", className || '')} onClick={onClickToggle(setter)}>
      <input type="checkbox" className="mr-1" checked={value} onChange={_ => null} />
      <label className="text-white font-bold cursor-pointer">{caption}</label>
    </div>

  )
}
