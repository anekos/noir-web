import React, {useState, useEffect} from 'react'
import './App.css'

import 'react-autocomplete-input/dist/bundle.css'
import arrayShuffle from 'array-shuffle'
import commonPathPrefix from 'common-path-prefix'
import escapeStringRegexp from 'escape-string-regexp'
import useKeypress from 'react-use-keypress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRandom, faStepBackward, faStepForward, faSpinner } from '@fortawesome/free-solid-svg-icons'

import Clock from './ui/Clock'
import EdgeButton from './ui/EdgeButton'
import ErrorMessage from './ui/ErrorMessage'
import ImageMeta from './ui/ImageMeta'
import ImagePath from './ui/ImagePath'
import Position from './ui/Position'
import useBufferedImage from './ui/use-buffered-image'
import useExpressionHistory from './use-expression-history'
import useImageHistory from './use-image-history'
import useInterval from './use-interval'
import { NoirImage, imageUrl } from './image'
import { search, SearchHistory } from './api'
import { useConfigPanel, Page } from './ui/use-config-panel'


function App() {
  // Hooks {{{
  const [errorMessage, setErrorMessage] = useState<string|null>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [pathPrefix, setPathPrefix] = useState<RegExp>(/^$/)
  const [images, setImages] = useState<null|NoirImage[]>(null)
  const [originalImages, setOriginalImages] = useState<null|NoirImage[]>(null)
  const [searching, setSearching] = useState<boolean>(false)
  const [firstSearch, setFirstSearch] = useState<boolean>(true)
  const expressionHistory = useExpressionHistory()

  const {
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
    shuffle,
    updateInterval,
  } = useConfigPanel(expressionHistory.items)

  const imageHistory = useImageHistory(images, random)

  useInterval(
    (page || !images || !autoNext) ? null : updateInterval,
    () => imageHistory[random ? 'random' : 'forward']()
  )

  const {Img, setUrl} = useBufferedImage({
    id: "noir-image",
    onLoad: imageOnLoad,
    onError: imageOnError,
    className: "z-0"
  })

  const ifNoPanel = (f: (...args: any) => void) => (page ? () => void 0 : f)

  useKeypress('j', ifNoPanel(moveOnClick('forward')))
  useKeypress('k', ifNoPanel(moveOnClick('backward')))
  useKeypress('g', ifNoPanel(moveOnClick('first')))
  useKeypress('G', ifNoPanel(moveOnClick('last')))
  useKeypress('Escape', () => setPage(null))

  useEffect(() => {
    setImages(null)
    setSearching(true)
    setPage(null)
    setErrorMessage(null)
    setFirstSearch(false)

    search(searchExpression, !firstSearch).then((result) => {
      setOriginalImages(Array.from(result.items))
      if (shuffle)
        result.items = arrayShuffle(result.items)
      const prefix = commonPathPrefix(result.items.map(it => it.file.path).slice(0, 100))
      const prefixPattern = new RegExp('^' + escapeStringRegexp(prefix))
      setImages(result.items)
      setPathPrefix(prefixPattern)
      setSearching(false)
      expressionHistory.refresh()
    }).catch(it => {
      setSearching(false)
      setErrorMessage(it.toString())
    })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchExpression])


  useEffect(() => {
    if (imageHistory?.currentImage) {
      setUrl(imageUrl(imageHistory?.currentImage))
    }
  }, [imageHistory, imageHistory.currentImage, setUrl])
  // }}}

  useEffect(() => {
    if (!originalImages)
      return
    setImages(shuffle ? arrayShuffle(originalImages) : originalImages)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle, setUrl])

  // Event Handlers {{{
  function imageOnLoad(_: any) {
    setLoadingTryles(0)
  }

  function imageOnError(_: any) {
    if (100 < loadingTries)
      return
    if (!images)
      return
    console.log('retry to load', {tries: loadingTries})
    setLoadingTryles(loadingTries + 1)
    imageHistory.forward()
  }

  function showPanelOnClick(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation()
    setPage(page ? null : Page.Search)
  }

  function moveOnClick(method: string) {
    return function() {
      imageHistory[method]()
    }
  }

  function historyOnClick(expression: string) {
    return () => {
      setSearchExpression(expression)
      setPage(Page.Search)
    }
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (page)
      return
    if (0 < e.deltaY) {
      moveOnClick('forward')()
    } else if (e.deltaY < 0) {
      moveOnClick('backward')()
    }
  }
  // }}}

  // Component {{{
  function Image({image}) {
    return (
      <div className="w-screen h-screen absolute z-10">
        { Img() }
      </div>)
  }

  function Content() {
    if (searching)
      return (<FontAwesomeIcon className="text-white" icon={faSpinner} size="6x" spin />)

    if (errorMessage)
      return (<ErrorMessage>{errorMessage}</ErrorMessage>)

    if (imageHistory?.currentImage)
      return (<Image image={imageHistory?.currentImage}/>)

    return (<ErrorMessage>No Image</ErrorMessage>)
  }

  function HistoryPanel() {
    return (
      <div className="z-40 bg-blue-500 p-2 opacity-90 rounded-md flex flex-col items-center">
        <div className="flex flex-row items-center w-full p-2">
          <ul className="list-inside list-decimal">
            { expressionHistory.items.map((history: SearchHistory, index: number) => {
              return (
                <li
                  key={index}
                  className="bg-green-500 rounded-md p-1 m-1 text-white cursor-pointer"
                  onClick={historyOnClick(history.expression)} >
                  {history.expression} <span className="text-gray-500">({history.uses})</span>
                </li>
              )
            }) }
          </ul>
        </div>
      </div>
    )
  }

  const Panel = () => {
    if (page === Page.History)
      return (<HistoryPanel />)
    if (page)
      return (
        <>
          { ConfigPanel }
          { imageHistory?.currentImage && images && <ImageMeta image={imageHistory.currentImage} images={images.length} /> }
        </>
      )
    return (<></>)
  }
  // }}}

  // <EdgeButton visible={!page} className="mx-1 w-screen h-12 inset-x-0 bottom-0" />

  return (
    <div className="App" onWheel={onWheel}>
      <EdgeButton visible={!page} className="my-1 h-screen w-12" onClick={ifNoPanel(moveOnClick('backward'))}>
        <FontAwesomeIcon icon={faStepBackward} size="2x" />
      </EdgeButton>
      <EdgeButton visible={!page} className="my-1 h-screen w-12 inset-y-0 right-0" onClick={ifNoPanel(moveOnClick('forward'))}>
        <FontAwesomeIcon icon={faStepForward} size="2x" />
      </EdgeButton>
      <EdgeButton visible={!page} className="mx-1 w-screen h-12" onClick={ifNoPanel(moveOnClick('random'))}>
        <FontAwesomeIcon icon={faRandom} size="2x" />
      </EdgeButton>

      { showClock && <Clock /> }
      { showPath && imageHistory?.currentImage && <ImagePath pathPrefix={pathPrefix} image={imageHistory.currentImage} /> }

      { showPosition && (imageHistory.position !== null) &&
          <Position current={ imageHistory.position + 1 } last={imageHistory.length} /> }

      <div className="w-screen h-screen bg-green-800 flex items-center justify-center" onClick={showPanelOnClick}>
        <Content />
        <div className="z-40 absolute flex flex-col items-center" onClick={ e => e.stopPropagation() }>
          { Panel() }
        </div>
      </div>
    </div>
  );
}

export default App;
