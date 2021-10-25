import {useEffect, useState} from 'react'

import { NoirImage } from '../image'


export default function useImageHistory(images: NoirImage[] | null, random: boolean) {
  const [position, setPosition] = useState<number|null>(null)

  useEffect(() => {
    if (!images || images.length === 0) {
      setPosition(null)
      return
    }
    if (random)
      setPosition(Math.floor(Math.random() * images.length))
    else
      setPosition(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images])

  return {
    get currentImage(): NoirImage | null {
      if (images === null || position === null)
        return null
      if (position < 0)
        return null
      if (images.length <= position)
        return null
      return images[position]
    },
    get position(): number | null {
      return position
    },
    get length(): number {
      return images ? images.length : 0
    },
    backward() {
      if (position === null || images === null || position === 0)
        return
      setPosition(position - 1)
    },
    first () {
      if (position === null || images === null || images.length <= 0)
        return
      setPosition(0)
    },
    forward () {
      if (position === null || images === null)
        return
      if (images.length - 1 <= position)
        return
      setPosition(position + 1)
    },
    hide() {
      setPosition(null)
    },
    last () {
      if (position === null || images === null)
        return
      setPosition(images.length - 1)
    },
    random () {
      if (position === null || images === null || images.length <= 0)
        return
      setPosition(Math.floor(Math.random() * images.length))
    },
    reset () {
      if (images && 0 < images.length)
        setPosition(0)
      else
        setPosition(null)
    },
  }
}
