interface ICheckBox {
  caption: string
  value: boolean
  setter: (x: (y: boolean) => boolean) => void
}
export default function CheckBox({caption, value, setter}: ICheckBox) {
  function onClickToggle(setter: (x: (y: boolean) => boolean) => void) {
    return function () {
      setter(it => !it)
    }
  }

  return (
    <div className="rounded-md bg-green-500 p-2 mr-2 cursor-pointer" onClick={onClickToggle(setter)}>
      <input type="checkbox" className="mr-1" checked={value} onChange={_ => null} />
      <label className="text-white font-bold cursor-pointer">{caption}</label>
    </div>

  )
}
