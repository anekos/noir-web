import React, {useEffect, useState} from 'react'

import CheckBox from './CheckBox'
import ExpressionEditor from './ExpressionEditor'
import Loading from './Loading'
import PanelFrame from './PanelFrame'
import { Alias, deleteAlias, getAlias, getAliases, updateAlias } from '../api'


interface IAliasList {
  aliases: string[]
  onClick: (name: string) => void
}
function AliasList({aliases, onClick}: IAliasList) {
  return (
    <ul className="list-inside list-decimal">
      { aliases.map((alias: string, index: number) => {
        return (
          <li
            key={index}
            className="bg-green-500 rounded-md p-1 m-1 text-white cursor-pointer"
            onClick={_ => onClick(alias)} >
            { alias }
          </li>
        )
      }) }
    </ul>
  )
}

interface IEditor {
  name: string
  onUpdate: (alias: Alias) => void
  onSearch: (expression: string) => void
  onCancel: () => void
  onDelete: () => void
}
function Editor({name, onCancel, onDelete, onUpdate, onSearch}: IEditor) {
  const [alias, setAlias] = useState<Alias | null>(null)

  useEffect(() => {
    getAlias(name).then(alias => {
      setAlias(alias ? alias : {expression: 'true', recursive: false})
    })
  }, [name])

  if (!alias)
    return (<Loading />)

  function setExpression(expression: string) {
    setAlias(Object.assign({}, alias, {expression}))
  }

  function setRecursive(recursive: boolean) {
    setAlias(Object.assign({}, alias, {recursive}))
  }

  async function deleteIt() {
    await deleteAlias(name)
    onDelete()
  }

  async function update(alias: Alias) {
    await updateAlias(name, alias)
    onUpdate(alias)
  }

  return (
    <PanelFrame>
      <div className="flex flex-col items-center">
        <h1 className="text-white font-bold mb-2">{name}</h1>
        <div className="flex flex-row items-center">
          <ExpressionEditor
            expression={alias.expression}
            setExpression={setExpression}
            className="w-full" />
          <CheckBox caption="Recursive" value={alias.recursive} setter={setRecursive} />
        </div>
        <div className="flex flex-row items-center mt-2">
          <input
            type="button"
            className='rounded-md p-2 bg-green-500 font-bold mx-2 text-white cursor-pointer'
            onClick={_ => update(alias)}
            value="Update" />
          <input
            type="button"
            className='rounded-md p-2 bg-green-500 font-bold mx-2 text-white cursor-pointer'
            onClick={_ => deleteIt()}
            value="Delete" />
          <input
            type="button"
            className='rounded-md p-2 bg-green-500 font-bold mx-2 text-white cursor-pointer'
            onClick={_ => onCancel()}
            value="Cancel" />
          <input
            type="button"
            className='rounded-md p-2 bg-green-500 font-bold mx-2 text-white cursor-pointer'
            onClick={_ => onSearch(alias.expression)}
            value="Search" />
        </div>
      </div>
    </PanelFrame>
  )
}

interface IAliasEditor {
  onSearch: (expression: string) => void
}
export default function AliasEditor({onSearch}: IAliasEditor) {
  const [aliases, setAliases] = useState<string[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [newName, setNewName] = useState<string>('')

  function updateAliases() {
    getAliases().then(it => it.sort()).then(setAliases)
  }

  useEffect(() => {
    updateAliases()
  }, [])

  function onUpdate() {
    setEditing(null)
    updateAliases()
  }

  if (editing)
    return (
      <Editor
        name={editing}
        onUpdate={onUpdate}
        onCancel={() => setEditing(null)}
        onDelete={onUpdate}
        onSearch={onSearch}
      />
    )

  return (
    <PanelFrame>
      <div className="flex flex-col items-center">
        <div className="flex flex-row items-center">
          <input
            type="text"
            className="rounded-md"
            placeholder="new alias"
            value={newName}
            size={10}
            onChange={e => setNewName(e.target.value)} />
          <input
            type="button"
            className='rounded-md p-1 bg-green-500 font-bold mx-2 text-white cursor-pointer'
            onClick={_ => setEditing(newName)}
            value="new" />
        </div>
        <AliasList aliases={aliases} onClick={setEditing} />
      </div>
    </PanelFrame>
  )
}

