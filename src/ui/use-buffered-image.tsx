import React, {useState} from 'react'

interface IUseBufferedImageResult {
  setUrl: any
  Img: any
}

export default function useBufferedImage({...props}) {
  const [url, setUrl] = useState<string|null>(null)
  const [buffered, setBuffered] = useState<string|null>(null)

  function onLoad() {
    setBuffered(url)
  }

  function Img() {
    return (
      <>
        { url && <img src={url} className="hidden" onLoad={onLoad} alt="buffer" /> }
        { buffered && <img src={buffered} {...props} alt="view" /> }
      </>
    )
  }

  return {Img, setUrl} as IUseBufferedImageResult
}
