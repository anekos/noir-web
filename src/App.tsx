import React, {useState, useEffect} from 'react'
import './App.css'

import 'react-autocomplete-input/dist/bundle.css'
import arrayShuffle from 'array-shuffle'
import classNames from 'classnames'
import commonPathPrefix from 'common-path-prefix'
import escapeStringRegexp from 'escape-string-regexp'
import useKeypress from 'react-use-keypress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRandom, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons'

import AliasEditor from './ui/AliasEditor'
import Clock from './ui/Clock'
import EdgeButton from './ui/EdgeButton'
import ErrorMessage from './ui/ErrorMessage'
import ImageMeta from './ui/ImageMeta'
import ImagePath from './ui/ImagePath'
import ImageTags from './ui/ImageTags'
import Loading from './ui/Loading'
import PanelFrame from './ui/PanelFrame'
import Position from './ui/Position'
import useBufferedImage from './ui/use-buffered-image'
import useExpressionHistory from './hook/use-expression-history'
import useImageHistory from './hook/use-image-history'
import useInterval from './hook/use-interval'
import { NoirImage, imageUrl } from './image'
import { isError } from './error'
import { search, SearchHistory } from './api'
import { useConfigPanel, Page } from './ui/use-config-panel'
import { useDelayedAction } from './hook/use-delayed-action'


function App() {
  // Hooks {{{
  const [doRecord, setDoRecord] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string|null>(null)
  const [firstSearch, setFirstSearch] = useState<boolean>(true)
  const [images, setImages] = useState<null|NoirImage[]>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [originalImages, setOriginalImages] = useState<null|NoirImage[]>(null)
  const [pathPrefix, setPathPrefix] = useState<RegExp>(/^$/)
  const [searching, setSearching] = useState<boolean>(false)
  const [showCursor, setShowCursor] = useState<boolean>(true)
  const [numbers, setNumbers] = useState<number | null>(null)
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
    showTags,
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
  const togglePanel = () => setTimeout(() => setPage(page === null ? Page.Search : null), 1)

  useKeypress('j', ifNoPanel(moveOnClick('forward')))
  useKeypress('k', ifNoPanel(moveOnClick('backward')))
  useKeypress('g', ifNoPanel(moveOnClick('first')))
  useKeypress('G', ifNoPanel(moveOnClick('last')))
  useKeypress('Escape', () => {
    if (numbers === null)
      togglePanel()
    else
      setNumbers(null)
  })
  useKeypress('s', ifNoPanel(togglePanel))
  useKeypress('x', ifNoPanel(moveOnClick('random')))
  for (let i = 0; i < 10; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeypress(i.toString(), ifNoPanel(() => {
      const n = numbers === null ? 0 : numbers
      setNumbers(n * 10 + i)
    }))
  }

  useEffect(() => {
    setImages(null)
    setSearching(true)
    setErrorMessage(null)
    setFirstSearch(false)

    const record = !firstSearch && doRecord

    search(searchExpression, record).then((result) => {
      setDoRecord(true)
      setSearching(false)

      if (isError(result)) {
        setErrorMessage(result.error.message)
        return
      }

      setOriginalImages(Array.from(result.items))
      if (shuffle)
        result.items = arrayShuffle(result.items)
      const prefix = commonPathPrefix(result.items.map(it => it.file.path).slice(0, 10000))
      const prefixPattern = new RegExp('^' + escapeStringRegexp(prefix))
      setImages(result.items)
      setPathPrefix(prefixPattern)
      expressionHistory.refresh()
    }).catch(it => {
      setDoRecord(true)
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

  useEffect(() => {
    if (!originalImages)
      return
    setImages(shuffle ? arrayShuffle(originalImages) : originalImages)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffle, setUrl])

  const cursor = useDelayedAction()

  // }}}

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
      imageHistory[method](numbers)
      setNumbers(null)
    }
  }

  function historyOnClick(expression: string) {
    return () => {
      setSearchExpression(expression)
      setPage(null)
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

  function onSearch(expression: string) {
    setDoRecord(false)
    setSearchExpression(expression)
  }

  function onCursorMove() {
    setShowCursor(true)
    cursor.fire(1000, () => setShowCursor(false))
  }
  // }}}

  // Component {{{
  function Image({image}) {
    return (
      <div className={classNames('w-screen h-screen absolute z-10', showCursor ? '' : 'noir-no-cursor')}>
        { Img() }
      </div>)
  }

  function Content() {
    if (searching)
      return (<Loading />)

    if (errorMessage)
      return (<ErrorMessage>{errorMessage}</ErrorMessage>)

    if (imageHistory?.currentImage)
      return (<Image image={imageHistory?.currentImage}/>)

    return (<ErrorMessage>No Image</ErrorMessage>)
  }

  function HistoryPanel() {
    return (
      <PanelFrame>
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
      </PanelFrame>
    )
  }

  const Panel = () => {
    if (page === Page.History)
      return (<HistoryPanel />)
    if (page === Page.Alias)
      return (<AliasEditor onSearch={onSearch} />)
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
    <div className="App" onWheel={onWheel} onMouseMove={onCursorMove}>
      <EdgeButton visible={!page} className="my-1 h-screen w-12" onClick={ifNoPanel(moveOnClick('backward'))}>
        <FontAwesomeIcon icon={faStepBackward} size="2x" />
      </EdgeButton>
      <EdgeButton visible={!page} className="my-1 h-screen w-12 inset-y-0 right-0" onClick={ifNoPanel(moveOnClick('forward'))}>
        <FontAwesomeIcon icon={faStepForward} size="2x" />
      </EdgeButton>
      <EdgeButton visible={!page} className="mx-1 w-screen h-12" onClick={ifNoPanel(moveOnClick('random'))}>
        <FontAwesomeIcon icon={faRandom} size="2x" />
      </EdgeButton>

      <div className="absolute left-0 bottom-0 z-50 hidden lg:block max-w-3/7">
        { showTags && imageHistory?.currentImage && <ImageTags path={imageHistory.currentImage.file.path} onSearch={onSearch}/> }
        { showPath && imageHistory?.currentImage && <ImagePath pathPrefix={pathPrefix} image={imageHistory.currentImage} /> }
      </div>

      { showPosition && (imageHistory.position !== null) &&
          <Position current={ imageHistory.position + 1 } last={imageHistory.length} /> }

      { showClock && <Clock /> }

      <div className="w-screen h-screen bg-green-800 flex items-center justify-center" onClick={showPanelOnClick}>
        <Content />
        { (page === null) && (numbers !== null) &&
            <div className="m-2 rounded-md p-2 z-50 bg-blue-500 opacity-80 text-white">
              {numbers}
            </div>
        }
        <div className="z-40 absolute flex flex-col items-center" onClick={ e => e.stopPropagation() }>
          { Panel() }
        </div>
      </div>
    </div>
  );
}

export default App;
