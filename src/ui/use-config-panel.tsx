import React, {useState, useEffect} from 'react'

import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { InputNumber } from "@supabase/ui"
import { faList } from '@fortawesome/free-solid-svg-icons'

import CheckBox from './CheckBox'
import ExpressionEditor from './ExpressionEditor'
import { SearchHistory } from '../api'
import { useLocalStorage } from '../hook/use-local-storage'


export enum Page { History = 1, Search, Alias }


const DefaultExpression = "path like '%wallpaper%'"


export function useConfigPanel(history: SearchHistory[]) {
  const [autoNext, setAutoNext] = useLocalStorage<boolean>('auto-next', true)
  const [page, setPage] = useState<Page | null>(null)
  const [random, setRandom] = useLocalStorage<boolean>('random', false)
  const [searchExpression, setSearchExpression] = useLocalStorage<string>('search-expression', DefaultExpression)
  const [showClock, setShowClock] = useLocalStorage<boolean>('show-clock', true)
  const [showPath, setShowPath] = useLocalStorage<boolean>('show-path', false)
  const [showTags, setShowTags] = useLocalStorage<boolean>('show-tags', false)
  const [showPosition, setShowPosition] = useLocalStorage<boolean>('show-position', false)
  const [shuffle, setShuffle] = useLocalStorage<boolean>('shuffle', true)
  const [updateInterval, setUpdateInterval] = useLocalStorage<number | null>('update-interval', 60)

  const [expressionBuffer, setExpressionBuffer] = useState(searchExpression)

  function changeExpression(expression: string) {
    setPage(null)
    setSearchExpression(expression)
    setExpressionBuffer(expression)
  }

  function fullscreenOnClick() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      if (document.exitFullscreen)
        document.exitFullscreen()
    }
    setPage(null)
  }

  function showHistoryOnClick() {
    setPage(Page.History)
  }

  function intervalOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseInt(e.target.value)
    if (isNaN(newValue))
      return
    if (newValue <= 0)
      setUpdateInterval(null)
    else
      setUpdateInterval(newValue)
  }

  useEffect(() => {
    setExpressionBuffer(searchExpression)
  }, [searchExpression])

  const expressionChanged = searchExpression !== expressionBuffer

  function Submit() {
    return (
      <input
        type="button"
        id="search-button"
        className={
          classNames(
            'rounded-md p-2 bg-green-500 font-bold mx-2',
            [expressionChanged ? 'text-white' : 'text-gray-200 line-through'],
            {'cursor-pointer': expressionChanged}
          )
        }
        onClick={_ => changeExpression(expressionBuffer)}
        value="Search" />
    )
  }

  function History() {
    return (
      <div
        className="rounded-md p-2 bg-green-500 text-white font-bold cursor-pointer"
        onClick={showHistoryOnClick}
      >
        <FontAwesomeIcon icon={faList} onClick={showHistoryOnClick}/>
      </div>
    )
  }

  const ConfigPanel = (
    <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center">

      <div className="flex flex-col items-center w-full m-1 p-1 visible xl:hidden">
        <div className="p-3 w-screen">
          <ExpressionEditor
            expression={expressionBuffer}
            setExpression={setExpressionBuffer}
            onSubmit={() => changeExpression(expressionBuffer)}
            className="w-11/12"
          />
        </div>
        <div className="flex flex-row">
          <Submit />
          <History />
        </div>
      </div>
      <div className="flex flex-row items-center w-full m-1 p-1 hidden xl:flex">
          <ExpressionEditor
            expression={expressionBuffer}
            setExpression={setExpressionBuffer}
            onSubmit={() => changeExpression(expressionBuffer)}
            className="w-96"
          />
        <Submit />
        <History />
      </div>

      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Interval" value={autoNext} setter={setAutoNext} />
        <InputNumber
          placeholder="Interval"
          defaultValue={updateInterval}
          onBlur={intervalOnChange}
          className="mr-2"
          min={1}
        />
        <CheckBox caption="Random" value={random} setter={setRandom} />
      </div>
      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Shuffle" value={shuffle} setter={setShuffle} />
        <input
          type="button"
          className="rounded-md p-2 mr-2 bg-green-500 text-white font-bold"
          onClick={fullscreenOnClick}
          value="Fullscreen" />
        <input
          type="button"
          className="rounded-md p-2 bg-green-500 text-white font-bold"
          onClick={_ => setPage(Page.Alias)}
          value="Alias" />
      </div>
      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Tags" value={showTags} setter={setShowTags} className="hidden lg:block" />
        <CheckBox caption="Path" value={showPath} setter={setShowPath} className="hidden lg:block"  />
        <CheckBox caption="Position" value={showPosition} setter={setShowPosition} />
        <CheckBox caption="Clock" value={showClock} setter={setShowClock} className="hidden lg:block"  />
      </div>
    </div>
  )

  return {
    ConfigPanel,
    autoNext,
    page,
    random,
    searchExpression,
    setPage,
    setSearchExpression,
    showClock,
    showPath,
    showPosition,
    showTags,
    shuffle,
    updateInterval,
  }
}

