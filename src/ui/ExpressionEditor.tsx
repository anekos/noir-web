import React, { useState } from 'react'

import classNames from 'classnames'

import Autosuggest from 'react-autosuggest'

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

interface Candidate {
  name: string
  value: string
  display: string
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
  const [suggestions, setSuggestions] = useState<Candidate[]>([])

  useEffectIfMounted((ifok) => { getAliases().then(sortIgnoreCase).then(ifok(setAliases)) }, [])
  useEffectIfMounted((ifok) => { getTags().then(sortIgnoreCase).then(ifok(setTags)) }, [])
  useEffectIfMounted((ifok) => { getHistory().then(ifok(setHistory)) }, [])

  function onKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      if (onSubmit)
        onSubmit()
    }
  }

  const onChange = (event, {newValue, method}) => {
    setExpression(newValue)
  }

  const inputProps = {
    onChange,
    onKeyPress,
    placeholder: 'Type a SQL where part',
    value: expression,
  };

  const onSuggestionsFetchRequested = ({value})=> {
    const newSuggestions: Candidate[] = []
    const maxCandidates = 20
    const adding = new Set()

    function append<T>(items: T[], name: string, prefix: string, keyCtor: (T) => string, valueCtor: (T) => string) {
      if (value[0] !== prefix)
        return
      let n = 0
      items.forEach((item: T) => {
        if (maxCandidates <= n)
          return
        const k = keyCtor(item)
        if (k.indexOf(value.slice(prefix.length)) < 0)
          return
        const v = valueCtor(item)
        if (adding.has(v))
          return
        adding.add(v)
        newSuggestions.push({value: v, name, display: v})
        n++
      })
    }

    append(tags, 'tag', '#', (it) => it, (it) => `#${it}`)
    append(aliases, 'alias', '@', (it) => it, (it) => it)
    append(history, 'history', '!', (it) => it.expression, (it) => it.expression)

    setSuggestions(newSuggestions)
  }

  const onSuggestionsClearRequested = () => {
    setSuggestions([])
  }

  return (
    <Autosuggest
      suggestions={suggestions}
      inputProps={inputProps}
      {...{
        getSuggestionValue,
        onChange,
        onSuggestionsClearRequested,
        onSuggestionsFetchRequested,
        renderInputComponent,
        renderSuggestion,
        renderSuggestionsContainer,
      }}
    />
  )
}

function renderSuggestion(item: Candidate, {query, isHighlighted}) {
  return (
    <span className={classNames(isHighlighted && 'font-bold')}>
      {item.display}
    </span>
  )
}

function getSuggestionValue(suggestion: Candidate) {
  return suggestion.value
}

function renderSuggestionsContainer({ containerProps, children, query }) {
  if (!children)
    return (<></>)
  return (
    <div {...containerProps} className="text-white absolute bg-green-900 drop-shadow-md p-2 rounded-sm z-50">
      {children}
    </div>
  );
}

function renderInputComponent(inputProps) {
  return (
    <textarea
      {...inputProps}
      autoFocus={true}
      className={classNames("rounded-md font-bold p-2 w-full text-sm h-24", inputProps.className)}
    />
  )
}
