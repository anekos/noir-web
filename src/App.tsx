import React, {useState, useEffect} from 'react';
import './App.css';

import { InputNumber } from "@supabase/ui";


const ApiEndPoint = 'http://localhost:9696'


interface NoirImage {
  file: {
    path: string
  }
  format: string
}

interface NoirSearchResult {
  items: NoirImage[]
}

function imageUrl(image: NoirImage): string {
  return `${ApiEndPoint}/file?path=${encodeURIComponent(image.file.path)}`
}

function selectImageRandomly(searchResult: NoirSearchResult): NoirImage | null {
  if (searchResult.items.length <= 0)
    return null
  return searchResult.items[Math.floor(Math.random() * searchResult.items.length)]
}

async function search(expression: string): Promise<NoirSearchResult> {
  return fetch(`${ApiEndPoint}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({expression}),
  }).then(it => it.json());
}


function App() {
  const DefaultExpression = "path like '%wallpaper%'"

  const [searchResult, setSearchResult] = useState<null|NoirSearchResult>(null)
  const [searchExpression, setSearchExpression] = useState(DefaultExpression)
  const [selectedImage, setSelectedImage] = useState<null|NoirImage>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)
  const [expressionBuffer, setExpressionBuffer] = useState(DefaultExpression)
  const [showPanel, setShowPanel] = useState<boolean>(false)
  const [updateInterval, setUpdateInterval] = useState<number>(3)

  const next = (result) => {
    if (!result || result.items.length <= 0) {
      console.log('No image')
      return
    }
    setSelectedImage(selectImageRandomly(result))
  }

  useEffect(() => {
    console.log(searchExpression)
    search(searchExpression).then((result) => {
      console.log('result.items.length', result.items.length)
      if (result.items.length <= 0) {
        window.alert('Not found')
        return
      }
      setSearchResult(result)
      next(result)
      setShowPanel(false)
    })
  }, [searchExpression])

  useEffect(() => {
    console.log('useEffect [selectedImage, searchResult, updateInterval]')
    const handle = setTimeout(() => next(searchResult), 1000 * updateInterval)
    return () => {
      console.log('clearTimeout')
      clearTimeout(handle)
    }
  }, [selectedImage, searchResult, updateInterval])

  function imageOnLoad(_: any) {
    console.log('imageOnLoad')
  }

  function imageOnError(_: any) {
    if (100 < loadingTries)
      return
    if (!searchResult)
      return
    setLoadingTryles(loadingTries + 1)
    console.log('imageOnLoad', {tries: loadingTries})
    setSelectedImage(selectImageRandomly(searchResult))
  }

  function expressionOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExpressionBuffer(e.target.value)
  }

  function topOnClick() {
    setShowPanel((it: boolean) => !it)
  }

  function fullscreenOnClick() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setShowPanel(false)
  }

  function intervalOnChange(e: any) {
    setUpdateInterval(e.target.value)
  }

  return (
    <div className="App">
      <div className="absolute bg-red-300 z-50 h-screen w-12 opacity-0">
        { /* LEFT */ }
      </div>

      <div className="absolute bg-red-300 z-50 w-screen h-12 opacity-0" onClick={topOnClick}>
        { /* TOP */ }
      </div>

      <div className="w-screen h-screen bg-green-800 flex items-center justify-center">

        <div className="w-screen h-screen absolute z-10">
          { selectedImage && <img
                              src={imageUrl(selectedImage)}
                              id="noir-image"
                              alt={selectedImage.format}
                              onLoad={imageOnLoad}
                              onError={imageOnError}
                              className="z-0"
                              onClick={topOnClick} />
          }
        </div>

        { showPanel &&
            <div className="z-40 bg-blue-500 p-8 absolute opacity-90 rounded-md flex flex-col items-center">
              <div className="rounded-md flex flex-row items-center">
                <input
                  type="text"
                  id="search-expression"
                  className="rounded-sm block m-2 font-bold flex-1"
                  onChange={expressionOnChange}
                  value={expressionBuffer} />
                <input
                  type="button"
                  id="search-button"
                  className="rounded-sm p-2 bg-green-500 text-white font-bold m-2"
                  onClick={_ => setSearchExpression(expressionBuffer)}
                  value="Search" />
              </div>
              <div className="rounded-md flex flex-row items-center">
                <InputNumber placeholder="Interval" onChange={intervalOnChange} value={updateInterval} />
              </div>
              <div className="rounded-md flex flex-row items-center">
                <input
                  type="button"
                  id="search-button"
                  className="rounded-sm p-2 bg-green-500 text-white font-bold m-2"
                  onClick={fullscreenOnClick}
                  value="Fullscreen" />
              </div>
            </div>
        }

      </div>
    </div>
  );
}

export default App;
