import React, {useState, useEffect} from 'react'
import './App.css'

import commonPathPrefix from 'common-path-prefix'
import escapeStringRegexp from 'escape-string-regexp'
import { InputNumber } from "@supabase/ui"
import { useTimer } from 'use-timer'

import Clock from './ui/Clock'
import EdgeButton from './ui/EdgeButton'
import { NoirImage, imageUrl } from './image'
import { NoirSearchResult } from './search_result'
import { search } from './api'
import { useLocalStorage } from './use-local-storage'


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

interface ICheckBox {
  caption: string
  value: boolean
  setter: (x: (y: boolean) => boolean) => void
}
function CheckBox({caption, value, setter}: ICheckBox) {
  function onClickToggle(setter: (x: (y: boolean) => boolean) => void) {
    return function () {
      setter(it => !it)
    }
  }

  return (
    <div className="rounded-md bg-green-500 p-2 mr-2">
      <input type="checkbox" id="clock-checkbox" className="mr-1" checked={value} onChange={onClickToggle(setter)} />
      <label htmlFor="clock-checkbox" className="text-white font-bold ">{caption}</label>
    </div>

  )
}

function App() {
  const DefaultExpression = "path like '%wallpaper%'"

  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [pathPrefix, setPathPrefix] = useState<RegExp>(/^$/)
  const [searchExpression, setSearchExpression] = useLocalStorage<string>('search-expression', DefaultExpression)
  const [searchResult, setSearchResult] = useState<null|NoirSearchResult>(null)
  const [selectedImage, setSelectedImage] = useState<null|NoirImage>(null)
  const [showClock, setShowClock] = useLocalStorage<boolean>('show-clock', true)
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [showPath, setShowPath] = useLocalStorage<boolean>('show-path', false)
  const [updateInterval, setUpdateInterval] = useLocalStorage<number>('update-interval', 60)

  const [expressionBuffer, setExpressionBuffer] = useState(searchExpression)

  const timer = useTimer({
    interval: Math.max(updateInterval, 1) * 1000,
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
    const newValue = parseInt(e.target.value)
    if (isNaN(newValue))
      return
    setUpdateInterval(newValue)
    if (!showPanel) {
      timer.reset()
      timer.start()
    }
  }

  function moveOnClick(mod: (number) => void) {
    timer.reset()
    if (!showPanel)
      timer.start()
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
    search(searchExpression).then((result) => {
      const prefix = commonPathPrefix(result.items.map(it => it.file.path))
      const prefixPattern = new RegExp('^' + escapeStringRegexp(prefix))
      setSearchResult(result)
      setPathPrefix(prefixPattern)
      setShowPanel(false)
    })
  }, [searchExpression])

  useEffect(() => next(searchResult), [searchResult])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => showPanel ? timer.pause() : timer.start(), [showPanel])

  return (
    <div className="App">
      <EdgeButton extraClass="my-1 h-screen w-12" onClick={_ => moveOnClick((it: number) => it - 1)} />
      <EdgeButton extraClass="my-1 h-screen w-12 inset-y-0 right-0" onClick={_ => moveOnClick((it: number) => it - 1)}/>
      <EdgeButton extraClass="mx-1 w-screen h-12" onClick={_ => moveOnClick((it: number) => it - 1)}/>
      <EdgeButton extraClass="mx-1 w-screen h-12 inset-x-0 bottom-0" onClick={_ => moveOnClick((it: number) => it - 1)}/>

      { showClock && <Clock /> }

      { showPath && selectedImage &&
          <div className="absolute left-0 bottom-0 m-2 rounded-md p-2 z-50 bg-gray-500 opacity-50 hover:opacity-90 text-bold text-white">
            { selectedImage.file.path.replace(pathPrefix, '') }
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
            <div className="z-40 absolute flex flex-col items-center" onClick={ e => e.stopPropagation() }>
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
                  <InputNumber
                    placeholder="Interval"
                    defaultValue={updateInterval}
                    onBlur={intervalOnChange}
                    min={1}
                  />
                </div>
                <div className="flex flex-row items-center">
                  <CheckBox caption="Path" value={showPath} setter={setShowPath} />
                  <CheckBox caption="Clock" value={showClock} setter={setShowClock} />
                  <input
                    type="button"
                    className="rounded-md p-2 bg-green-500 text-white font-bold m-2"
                    onClick={fullscreenOnClick}
                    value="Fullscreen" />
                </div>
                <div className="flex flex-row items-center">
                  <div>
                    { searchResult &&
                        <div>
                          { searchResult.items.length } images
                        </div>
                    }
                  </div>
                </div>
              </div>

              { selectedImage &&
                  <div className="z-40 bg-gray-500 p-2 opacity-90 rounded-md flex flex-col items-center w-full mt-2">
                    <textarea
                      className="w-full bg-gray-300"
                      rows={12}
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
