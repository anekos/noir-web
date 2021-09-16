import React, {useState, useEffect} from 'react'

import TextInput from 'react-autocomplete-input'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { InputNumber } from "@supabase/ui"
import { faList } from '@fortawesome/free-solid-svg-icons'

import CheckBox from './CheckBox'
import { getAliases } from '../api'
import { useLocalStorage } from '../use-local-storage'


const DefaultExpression = "path like '%wallpaper%'"


export default function useConfigPanel() {
  const [aliases, setAliases] = useState<string[]>([])
  const [autoNext, setAutoNext] = useLocalStorage<boolean>('auto-next', true)
  const [searchExpression, setSearchExpression] = useLocalStorage<string>('search-expression', DefaultExpression)
  const [showClock, setShowClock] = useLocalStorage<boolean>('show-clock', true)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [showPath, setShowPath] = useLocalStorage<boolean>('show-path', false)
  const [updateInterval, setUpdateInterval] = useLocalStorage<number | null>('update-interval', 60)
  const [expressionBuffer, setExpressionBuffer] = useState(searchExpression)

  function changeExpression(expression: string) {
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
    setShowPanel(false)
  }

  function showHistoryOnClick() {
    setShowHistory(true)
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
    getAliases().then(setAliases)
  }, [])

  useEffect(() => {
    if (!showPanel)
      setShowHistory(false)
  }, [showPanel])

  useEffect(() => {
    setExpressionBuffer(searchExpression)
  }, [searchExpression])

  const expressionChanged = expressionBuffer !== searchExpression

  const ConfigPanel = (
    <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center">
      <div className="flex flex-row items-center w-full m-1 p-1">
        <TextInput
          options={aliases}
          trigger="@"
          changeOnSelect={(trigger, suffix) => suffix}
          onChange={setExpressionBuffer}
          value={expressionBuffer}
          maxOptions={20}
          className="rounded-md block mx-2 font-bold flex-1 h-8 p-2 w-96 h-20" />
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
        <div
          className="rounded-md p-2 bg-green-500 text-white font-bold cursor-pointer"
          onClick={showHistoryOnClick}
        >
          <FontAwesomeIcon icon={faList} onClick={showHistoryOnClick}/>
        </div>
      </div>
      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Interval" value={autoNext} setter={setAutoNext} />
        <InputNumber
          placeholder="Interval"
          defaultValue={updateInterval}
          onBlur={intervalOnChange}
          min={1}
        />
      </div>
      <div className="flex flex-row items-center m-1 p-1">
        <CheckBox caption="Path" value={showPath} setter={setShowPath} />
        <CheckBox caption="Clock" value={showClock} setter={setShowClock} />
        <input
          type="button"
          className="rounded-md p-2 bg-green-500 text-white font-bold"
          onClick={fullscreenOnClick}
          value="Fullscreen" />
      </div>
    </div>
  )

  return {
    ConfigPanel,
    autoNext,
    searchExpression,
    setSearchExpression,
    setShowPanel,
    showClock,
    showHistory,
    showPanel,
    showPath,
    updateInterval,
  }
}

