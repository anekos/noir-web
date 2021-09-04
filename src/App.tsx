import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import './App.css';


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

  useEffect(() => {
    console.log(searchExpression)
    search(searchExpression).then((result) => {
      if (result.items.length <= 0) {
        window.alert('Not found')
        return
      }
      setSearchResult(result)
    })
  }, [searchExpression])

  useEffect(() => {
    if (!searchResult || searchResult.items.length <= 0)
      return

    const next = () => setSelectedImage(selectImageRandomly(searchResult))
    next()
    const handle = setInterval(next, 10000)
    return () => clearInterval(handle)
  }, [searchResult])

  function imageOnLoad(_: any) {
    console.log('imageOnLoad')
  }

  function imageOnError(_: any) {
    if (100 < loadingTries)
      return
    if (!searchResult)
      return
    setLoadingTryles(loadingTries + 1)
    console.log('Loading tries', loadingTries)
    setSelectedImage(selectImageRandomly(searchResult))
  }

  function expressionOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setExpressionBuffer(e.target.value)
  }

  function topOnClick() {
    setShowPanel((it: boolean) => !it)
  }

  return (
    <div className="App">
      <div className="absolute bg-red-300 z-50 h-screen w-12 opacity-100">
        { /* LEFT */ }
      </div>

      <div className="absolute bg-red-300 z-50 w-screen h-12 opacity-100" onClick={topOnClick}>
        { /* TOP */ }
      </div>

      <div className="w-screen h-screen bg-green-800 flex items-center justify-center">

        <div className="w-screen h-screen absolute z-10">
          { selectedImage ? <img
                             src={imageUrl(selectedImage)}
                             id="noir-image"
                             alt={selectedImage.format}
                             onLoad={imageOnLoad}
                             onError={imageOnError}
                             className="z-0"
                           />
                          : <img src={logo} className="App-logo" alt="logo" />
          }
        </div>

        { showPanel &&
            <div className="z-40 bg-blue-500 p-8 absolute opacity-80 rounded-md flex items-center">
              <input
                type="text"
                id="search-expression"
                className="rounded-sm block m-2 font-bold"
                onChange={expressionOnChange}
                value={expressionBuffer} />
              <input
                type="button"
                id="search-button"
                className="rounded-sm p-2 bg-green-500 text-white font-bold"
                onClick={_ => setSearchExpression(expressionBuffer)}
                value="Search" />

          </div>
        }

      </div>
    </div>
  );
}

export default App;
