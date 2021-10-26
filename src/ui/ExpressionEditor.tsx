import React, { useState } from 'react'

import classNames from 'classnames'

import TextInput from 'react-autocomplete-input'
import { SearchHistory } from '../api'
import { getAliases, getHistory, getTags } from '../api'
import { useEffectIfMounted } from '../hook/use-effect-if-mounted'


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
  onSubmit?: () => void
  className: string
}
export default function ExpressionEditor({expression, setExpression, onSubmit, className}: IExpressionEditor) {
  const [aliases, setAliases] = useState<string[]>([])
  const [history, setHistory] = useState<SearchHistory[]>([])
  const [tags, setTags] = useState<string[]>([])

  useEffectIfMounted((ifok) => { getAliases().then(sortIgnoreCase).then(ifok(setAliases)) }, [])
  useEffectIfMounted((ifok) => { getTags().then(sortIgnoreCase).then(ifok(setTags)) }, [])
  useEffectIfMounted((ifok) => { getHistory().then(ifok(setHistory)) }, [])

  const expressions = history.map(it => it.expression)

  function changeOnSelect(trigger, suffix) {
    if (trigger === '@' || trigger === '!')
      return suffix
    return trigger + suffix
  }

  function onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      if (onSubmit)
        onSubmit()
    }
  }

  return (
    <TextInput
      autoFocus={true}
      options={{'@': aliases, '#': tags, '!': expressions}}
      trigger={['@', '#', '!']}
      changeOnSelect={changeOnSelect}
      onChange={setExpression}
      value={expression}
      maxOptions={20}
      onKeyPress={onKeyPress}
      className={classNames("rounded-md font-bold p-2 w-full", className)} />
  )
}
