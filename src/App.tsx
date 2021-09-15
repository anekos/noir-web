import React, {useState, useEffect} from 'react'
import './App.css'

import 'react-autocomplete-input/dist/bundle.css'
import TextInput from 'react-autocomplete-input'
import classNames from 'classnames'
import commonPathPrefix from 'common-path-prefix'
import escapeStringRegexp from 'escape-string-regexp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { InputNumber } from "@supabase/ui"
import { useTimer } from 'use-timer'

import Clock from './ui/Clock'
import EdgeButton from './ui/EdgeButton'
import ImagePath from './ui/ImagePath'
import Position from './ui/Position'
import CheckBox from './ui/CheckBox'
import ErrorMessage from './ui/ErrorMessage'
import useExpressionHistory from './use-expression-history'
import useImageHistory from './use-image-history'
import { NoirImage, imageUrl } from './image'
import { NoirSearchResult } from './search_result'
import { getAliases, search } from './api'
import { useLocalStorage } from './use-local-storage'


function selectImageRandomly(searchResult: NoirSearchResult): NoirImage | null {
  if (searchResult.items.length <= 0)
    return null
  return searchResult.items[Math.floor(Math.random() * searchResult.items.length)]
}

function App() {
  const DefaultExpression = "path like '%wallpaper%'"

  const [aliases, setAliases] = useState<string[]>([])
  const [autoNext, setAutoNext] = useLocalStorage<boolean>('auto-next', true)
  const [errorMessage, setErrorMessage] = useState<string|null>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [pathPrefix, setPathPrefix] = useState<RegExp>(/^$/)
  const [searchExpression, setSearchExpression] = useLocalStorage<string>('search-expression', DefaultExpression)
  const [searchResult, setSearchResult] = useState<null|NoirSearchResult>(null)
  const [searching, setSearching] = useState<boolean>(false)
  const [showClock, setShowClock] = useLocalStorage<boolean>('show-clock', true)
  const [showHistory, setShowHistory] = useState<boolean>(false)
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [showPath, setShowPath] = useLocalStorage<boolean>('show-path', false)
  const [updateInterval, setUpdateInterval] = useLocalStorage<number>('update-interval', 60)
  const expressionHistory = useExpressionHistory()
  const imageHistory = useImageHistory()

  const [expressionBuffer, setExpressionBuffer] = useState(searchExpression)

  const timer = useTimer({
    interval: Math.max(updateInterval, 1) * 1000,
    autostart: false,
    onTimeUpdate: (t: number) => {
      next(searchResult)
    }
  })

  const selectedImage: NoirImage | null = imageHistory.currentImage

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
    const image = selectImageRandomly(searchResult)
    if (image !== null)
      imageHistory.push(image, true)
  }

  function expressionOnChange(value) {
    setExpressionBuffer(value)
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

  function nextOnClick() {
    timer.reset()
    if (!showPanel && autoNext)
      timer.start()
    next(searchResult)
  }

  function moveOnClick(backword: boolean) {
    return function() {
      if (imageHistory.inThePast || backword)
        imageHistory[backword ? 'backward' : 'forward']()
      else
        return nextOnClick()
    }
  }

  function next (result: NoirSearchResult | null) {
    if (!result || result.items.length <= 0) {
      imageHistory.hide()
      return
    }
    const image = selectImageRandomly(result)
    if (image) {
      imageHistory.push(image, true)
    }
  }

  function ifNoPanel(f: (...args) => void) {
    return showPanel ? () => void 0 : f
  }

  function showHistoryOnClick() {
    console.log('false')
    setShowHistory(true)
  }

  function changeExpression(expression: string) {
    setSearchExpression(expression)
    setExpressionBuffer(expression)
  }

  function historyOnClick(expression: string) {
    return () => {
      changeExpression(expression)
      setShowPanel(false)
    }
  }

  useEffect(() => {
    setSearchResult(null)
    setSearching(true)
    setShowPanel(false)
    search(searchExpression).then((result) => {
      const prefix = commonPathPrefix(result.items.map(it => it.file.path))
      const prefixPattern = new RegExp('^' + escapeStringRegexp(prefix))
      setSearchResult(result)
      setPathPrefix(prefixPattern)
      setSearching(false)
      expressionHistory.push(searchExpression)
    }).catch(it => {
      setSearching(false)
      setErrorMessage(it.toString())
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpression])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => next(searchResult), [searchResult])

  useEffect(() => {
    if (showPanel) {
      timer.pause()
    } else if (imageHistory.inThePast || !autoNext) {
      timer.reset()
    } else {
      timer.start()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageHistory.inThePast, autoNext, showPanel])

  useEffect(() => {
    if (!showPanel)
      setShowHistory(false)
  }, [showPanel])

  useEffect(() => {
    getAliases().then(setAliases)
  }, [])

  const expressionChanged = expressionBuffer !== searchExpression

  return (
    <div className="App">
      <EdgeButton visible={!showPanel} className="my-1 h-screen w-12" onClick={ifNoPanel(moveOnClick(true))} />
      <EdgeButton visible={!showPanel} className="my-1 h-screen w-12 inset-y-0 right-0" onClick={ifNoPanel(moveOnClick(false))}/>
      <EdgeButton visible={!showPanel} className="mx-1 w-screen h-12" onClick={ifNoPanel(nextOnClick)}/>
      <EdgeButton visible={!showPanel} className="mx-1 w-screen h-12 inset-x-0 bottom-0" onClick={ifNoPanel(nextOnClick)}/>

      { showClock && <Clock /> }
      { showPath && selectedImage && <ImagePath pathPrefix={pathPrefix} image={selectedImage} /> }

      { (imageHistory.inThePast && imageHistory.position !== null) && 
          <Position current={ imageHistory.position + 1 } last={imageHistory.length} /> }

      <div className="w-screen h-screen bg-green-800 flex items-center justify-center" onClick={showPanelOnClick}>

        { searching && <FontAwesomeIcon className="text-white" icon={faSpinner} size="6x" spin /> }

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
            : (searching || <ErrorMessage>{errorMessage ? errorMessage : 'No Image'}</ErrorMessage>)
        }

        { showPanel &&
            <div className="z-40 absolute flex flex-col items-center" onClick={ e => e.stopPropagation() }>
              { showHistory
                  ? <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center">
                      <div className="flex flex-row items-center w-full p-2">
                        <ul className="list-inside list-decimal">
                          { expressionHistory.items.map((exp, index) => {
                              return (<li key={index} className="bg-green-500 rounded-md p-1 m-1 text-white cursor-pointer" onClick={historyOnClick(exp)}>{exp}</li>)
                          }) }
                        </ul>
                      </div>
                    </div>
                  : <>
                      <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center">
                        <div className="flex flex-row items-center w-full m-1 p-1">
                          <TextInput
                            options={aliases}
                            trigger="@"
                            changeOnSelect={(trigger, suffix) => suffix}
                            onChange={expressionOnChange}
                            value={expressionBuffer}
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

                      { selectedImage && 
                          <div className="z-30 bg-gray-500 p-2 opacity-90 rounded-md flex flex-col items-center w-full mt-2">
                            <div className="flex flex-row items-center mb-1">
                              <div>
                                { searchResult &&
                                    <div className="font-bold text-white">
                                      { searchResult.items.length } images
                                    </div>
                                }
                              </div>
                            </div>
                            <textarea
                              className="w-full bg-gray-300"
                              rows={12}
                              defaultValue={JSON.stringify(selectedImage, null, '  ')} />
                          </div>
                      }
                    </>
              }
            </div>
          }

      </div>
    </div>
  );
}

export default App;
