import React, {useState, useEffect} from 'react'

import { InputNumber } from "@supabase/ui"

import ExpressionEditor from './ExpressionEditor'
import { Button, CheckBox } from '../ui/input'
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

  const ConfigPanel = (
    <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center">

      <div className="flex flex-col items-center w-full p-1">
        <div className="p-1 w-full">
          <ExpressionEditor
            expression={expressionBuffer}
            setExpression={setExpressionBuffer}
            onSubmit={() => changeExpression(expressionBuffer)}
            className="w-11/12"
          />
        </div>
        <div className="flex flex-row">
          <Button
            className={expressionChanged ? '' : 'line-through'}
            disabled={!expressionChanged}
            onClick={_ => changeExpression(expressionBuffer)}
          >
            Search
          </Button>
          <Button onClick={showHistoryOnClick}>History</Button>
          <Button onClick={_ => setPage(Page.Alias)}>Alias</Button>
        </div>
      </div>

      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Interval" value={autoNext} setter={setAutoNext} />
        <InputNumber
          placeholder="Interval"
          defaultValue={updateInterval}
          onBlur={intervalOnChange}
          className="mx-2"
          min={1}
        />
        <CheckBox caption="Random" value={random} setter={setRandom} />
      </div>
      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Shuffle" value={shuffle} setter={setShuffle} />
        <Button onClick={fullscreenOnClick}>Fullscreen</Button>
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

