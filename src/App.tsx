import React, {useState, useEffect} from 'react'
import './App.css'

import classNames from 'classnames'
import strftime from 'strftime'
import { InputNumber } from "@supabase/ui"
import { useTimer } from 'use-timer'

import { NoirImage, imageUrl } from './image'
import { NoirSearchResult } from './search_result'
import { search } from './api'
import Storage from './storage'


function selectImageRandomly(searchResult: NoirSearchResult): NoirImage | null {
  if (searchResult.items.length <= 0)
    return null
  return searchResult.items[Math.floor(Math.random() * searchResult.items.length)]
}

function NoImage() {
  return (
    <span className="rounded-md bg-red-800 p-3 text-white font-bold">
      No Image
    </span>
  )
}

function SideButton({children, extraClass, onClick}) {
  return (
    <div
      className={classNames('absolute bg-green-300 z-50 h-screen w-12 rounded-md my-1 opacity-0 hover:opacity-80', extraClass)}
      onClick={onClick}
    >
      { children }
    </div>
  )
}

function App() {
  const DefaultExpression = "path like '%wallpaper%'"

  const [searchResult, setSearchResult] = useState<null|NoirSearchResult>(null)
  const [searchExpression, setSearchExpression] = useState(Storage.get<string>('search-expression', DefaultExpression))
  const [selectedImage, setSelectedImage] = useState<null|NoirImage>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [expressionBuffer, setExpressionBuffer] = useState(searchExpression)
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [updateInterval, setUpdateInterval] = useState<number>(Storage.get<number>('update-interval', 60))
  const [showClock, setShowClock] = useState<boolean>(Storage.get<boolean>('show-clock', true))
  const timer = useTimer({
    interval: updateInterval * 1000,
    autostart: false,
    onTimeUpdate: (t: number) => {
      next(searchResult)
    }
  })

  function imageOnLoad(_: any) {
    setLoadingTryles(0)
  }

  function imageOnError(_: any) {
    if (100 < loadingTries)
      return
    if (!searchResult)
      return
    console.log('retry to load', {tries: loadingTries})
    setLoadingTryles(loadingTries + 1)
    setSelectedImage(selectImageRandomly(searchResult))
  }

  function expressionOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExpressionBuffer(e.target.value)
  }

  function showPanelOnClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation()
    setShowPanel((it: boolean) => !it)
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

  function intervalOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUpdateInterval(parseInt(e.target.value))
    if (!showPanel) {
      timer.reset()
      timer.start()
    }
  }

  function clockOnChange() {
    Storage.set('show-clock', !showClock)
    setShowClock(it => !it)
  }

  function moveOnClick(mod: (number) => void) {
    next(searchResult)
  }

  function next (result: NoirSearchResult | null) {
    if (!result || result.items.length <= 0) {
      setSelectedImage(null)
      return
    }
    setSelectedImage(selectImageRandomly(result))
  }

  useEffect(() => {
    Storage.set('search-expression', searchExpression)

    search(searchExpression).then((result) => {
      setSearchResult(result)
      setShowPanel(false)
    })
  }, [searchExpression])

  useEffect(() => next(searchResult), [searchResult])

  useEffect(() => Storage.set('update-interval', updateInterval), [updateInterval])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => showPanel ? timer.pause() : timer.start(), [showPanel])

  return (
    <div className="App">
      <SideButton extraClass="" onClick={_ => moveOnClick((it: number) => it - 1)}>
      </SideButton>

      <SideButton extraClass="inset-y-0 right-0" onClick={_ => moveOnClick((it: number) => it - 1)}>
      </SideButton>

      { showClock &&
          <div className="absolute right-0 bottom-0 m-2 rounded-md p-2 z-50 bg-gray-500 opacity-30 hover:opacity-90 text-bold text-white">
            { strftime('%Y-%m-%d (%a) %H:%M') }
          </div> }

      <div className="w-screen h-screen bg-green-800 flex items-center justify-center" onClick={showPanelOnClick}>

        { selectedImage
            ? <div className="w-screen h-screen absolute z-10">
                <img
                  src={imageUrl(selectedImage)}
                  id="noir-image"
                  alt={selectedImage.format}
                  onLoad={imageOnLoad}
                  onError={imageOnError}
                  className="z-0" />
              </div>
            : <NoImage />
        }

        { showPanel &&
        <div className="z-40 p-8 absolute flex flex-col items-center" onClick={ e => e.stopPropagation() }>

              <div className="z-40 bg-blue-500 p-8 opacity-90 rounded-md flex flex-col items-center">
                <div className="flex flex-row items-center">
                  <input
                    type="text"
                    id="search-expression"
                    className="rounded-md block m-2 font-bold flex-1"
                    onChange={expressionOnChange}
                    value={expressionBuffer} />
                  <input
                    type="button"
                    id="search-button"
                    className="rounded-md p-2 bg-green-500 text-white font-bold m-2"
                    onClick={_ => setSearchExpression(expressionBuffer)}
                    value="Search" />
                </div>
                <div className="flex flex-row items-center m-2">
                  <InputNumber placeholder="Interval" onChange={intervalOnChange} value={updateInterval} />
                </div>
                <div className="flex flex-row items-center">
                  <div className="rounded-md bg-green-500 p-2">
                    <input type="checkbox" id="clock-checkbox" className="mr-1" checked={showClock} onChange={clockOnChange} />
                    <label htmlFor="clock-checkbox" className="text-white font-bold ">Clock</label>
                  </div>
                </div>
                <div className="flex flex-row items-center">
                  <input
                    type="button"
                    id="search-button"
                    className="rounded-md p-2 bg-green-500 text-white font-bold m-2"
                    onClick={fullscreenOnClick}
                    value="Fullscreen" />
                </div>
              </div>

              { selectedImage &&
                  <div className="z-40 bg-gray-500 p-2 opacity-90 rounded-md flex flex-col items-center w-full mt-2">
                    <textarea
                      className="w-full bg-gray-300"
                      rows={12}
                      wrap="off"
                      defaultValue={JSON.stringify(selectedImage, null, '  ')} />
                  </div>
              }

            </div>
          }

      </div>
    </div>
  );
}

export default App;
