import React, {useState, useEffect} from 'react'

import TextInput from 'react-autocomplete-input'
import { SearchHistory } from '../api'
import { getAliases, getHistory, getTags } from '../api'


function sortIgnoreCase(lst: string[]): string[] {
  function cmp(a: string, b: string): number {
    const ua = a.toUpperCase()
    const ub = b.toUpperCase()
    if (ua < ub)
      return -1
    if (ua > ub)
      return 1
    return 0
  }

  return Array.from(lst).sort(cmp)
}

interface IExpressionEditor {
  expression: string
  setExpression: (e: string) => void
}
export default function ExpressionEditor({expression, setExpression}: IExpressionEditor) {
  const [aliases, setAliases] = useState<string[]>([])
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => { getAliases().then(sortIgnoreCase).then(setAliases) }, [])
  useEffect(() => { getTags().then(sortIgnoreCase).then(setTags) }, [])
  useEffect(() => { getHistory().then(setHistory) }, [])

  const expressions = history.map(it => it.expression)

  function changeOnSelect(trigger, suffix) {
    if (trigger === '@' || trigger === '!')
      return suffix
    return trigger + suffix
  }

  return (
    <TextInput
      options={{'@': aliases, '#': tags, '!': expressions}}
      trigger={['@', '#', '!']}
      changeOnSelect={changeOnSelect}
      onChange={setExpression}
      value={expression}
      maxOptions={20}
      className="rounded-md block mx-2 font-bold flex-1 h-8 p-2 w-96 h-20" />
  )
}