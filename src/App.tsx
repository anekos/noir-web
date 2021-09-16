import React, {useState, useEffect} from 'react'
import './App.css'

import 'react-autocomplete-input/dist/bundle.css'
import commonPathPrefix from 'common-path-prefix'
import escapeStringRegexp from 'escape-string-regexp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

import Clock from './ui/Clock'
import EdgeButton from './ui/EdgeButton'
import ErrorMessage from './ui/ErrorMessage'
import ImageMeta from './ui/ImageMeta'
import ImagePath from './ui/ImagePath'
import Position from './ui/Position'
import useConfigPanel from './ui/useConfigPanel'
import useExpressionHistory from './use-expression-history'
import useImageHistory from './use-image-history'
import useInterval from './use-interval'
import { NoirImage, imageUrl } from './image'
import { NoirSearchResult } from './search_result'
import { search } from './api'


function selectImageRandomly(searchResult: NoirSearchResult): NoirImage | null {
  if (searchResult.items.length <= 0)
    return null
  return searchResult.items[Math.floor(Math.random() * searchResult.items.length)]
}

function App() {
  const [errorMessage, setErrorMessage] = useState<string|null>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [pathPrefix, setPathPrefix] = useState<RegExp>(/^$/)
  const [searchResult, setSearchResult] = useState<null|NoirSearchResult>(null)
  const [searching, setSearching] = useState<boolean>(false)
  const expressionHistory = useExpressionHistory()
  const imageHistory = useImageHistory()

  const {
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
  } = useConfigPanel()

  useInterval(
    (showPanel || !searchResult || imageHistory.inThePast || !autoNext) ? null : updateInterval,
    () => next()
  )

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

  function showPanelOnClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation()
    setShowPanel((it: boolean) => !it)
  }

  function moveOnClick(backword: boolean) {
    return function() {
      if (imageHistory.inThePast || backword)
        imageHistory[backword ? 'backward' : 'forward']()
      else
        return next()
    }
  }

  function next () {
    if (!searchResult || searchResult.items.length <= 0) {
      imageHistory.hide()
      return
    }
    const image = selectImageRandomly(searchResult)
    if (image)
      imageHistory.push(image, true)
  }

  function historyOnClick(expression: string) {
    return () => {
      setSearchExpression(expression)
      setShowPanel(false)
    }
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (0 < e.deltaY) {
      moveOnClick(false)()
    } else if (e.deltaY < 0) {
      moveOnClick(true)()
    }
  }

  const ifNoPanel = (f: (...args: any) => void) => (showPanel ? () => void 0 : f)

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

      const selectedImage = selectImageRandomly(result)
      if (selectedImage !== null)
        imageHistory.push(selectedImage, true)
    }).catch(it => {
      setSearching(false)
      setErrorMessage(it.toString())
    })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpression])

  return (
    <div className="App" onWheel={onWheel}>
      <EdgeButton visible={!showPanel} className="my-1 h-screen w-12" onClick={ifNoPanel(moveOnClick(true))} />
      <EdgeButton visible={!showPanel} className="my-1 h-screen w-12 inset-y-0 right-0" onClick={ifNoPanel(moveOnClick(false))}/>
      <EdgeButton visible={!showPanel} className="mx-1 w-screen h-12" onClick={ifNoPanel(next)}/>
      <EdgeButton visible={!showPanel} className="mx-1 w-screen h-12 inset-x-0 bottom-0" onClick={ifNoPanel(next)}/>

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
                          { expressionHistory.items.map((exp: string, index: number) => {
                              return (<li key={index} className="bg-green-500 rounded-md p-1 m-1 text-white cursor-pointer" onClick={historyOnClick(exp)}>{exp}</li>)
                          }) }
                        </ul>
                      </div>
                    </div>
                 : <>
                    {ConfigPanel}
                   { selectedImage && searchResult &&
                     <ImageMeta image={selectedImage} images={searchResult.items.length} /> }
                   </>
              }
            </div>
          }

      </div>
    </div>
  );
}

export default App;
