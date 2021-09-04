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
  const [searchResult, setSearchResult] = useState<null|NoirSearchResult>(null)
  const [searchExpression, setSearchExpression] = useState("path like '%wallpaper%'")
  const [selectedImage, setSelectedImage] = useState<null|NoirImage>(null)
  const [loadingTries, setLoadingTryles] = useState<number>(0)

  useEffect(() => {
    search(searchExpression).then((result) => setSearchResult(result))
  }, [searchExpression])

  if (searchResult && 0 < searchResult.items.length && !selectedImage) {
    setSelectedImage(selectImageRandomly(searchResult))
  }

  function imageOnLoad(_: any) {
    setTimeout(() => {
      if (!searchResult)
        return
      setSelectedImage(selectImageRandomly(searchResult))
      setLoadingTryles(0)
    }, 10000)
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

  return (
    <div className="App">
        { selectedImage ? <img
                            src={imageUrl(selectedImage)}
                            id="noir-image"
                            alt={selectedImage.format}
                            onLoad={imageOnLoad}
                            onError={imageOnError}
                          />
                        : <img src={logo} className="App-logo" alt="logo" />
        }
    </div>
  );
}

export default App;
