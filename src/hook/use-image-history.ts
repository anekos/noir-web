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
    backward(n?: number) {
      if (position === null || images === null || position === 0)
        return
      const next: number = Math.max(0, position - (n || 1))
      setPosition(next)
    },
    first (n?: number) {
      if (position === null || images === null || images.length <= 0)
        return
      const next: number = Math.min(images.length - 1, (n || 1) - 1)
      setPosition(next)
    },
    forward (n?: number) {
      if (position === null || images === null)
        return
      if (images.length - 1 <= position)
        return
      const next: number = Math.min(images.length - 1, position + (n || 1))
      setPosition(next)
    },
    hide() {
      setPosition(null)
    },
    last (n?: number) {
      if (position === null || images === null)
        return
      const _n = n ? n - 1 : images.length - 1
      const next: number = Math.min(images.length - 1, _n)
      setPosition(next)
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
