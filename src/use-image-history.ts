import {useState} from 'react'

import { NoirImage } from './image'


interface History {
  items: NoirImage[]
  position: number | null
}


export default function useImageHistory() {
  const [state, setState] = useState<History>({items: [], position: null})

  function update(modify: (a: History) => void) {
    const next: History = Object.create(state)
    modify(next)
    setState(next)
  }

  return {
    get currentImage(): NoirImage | null {
      if (state.position === null || state.position < 0 || state.items.length <= state.position)
          return null
      return state.items[state.position]
    },
    get inThePast(): boolean {
      if (state.position === null)
        return true
      return state.position < state.items.length - 1
    },
    backward() {
      update(state => {
        if (state.position === null) {
          if (state.items.length === 0)
            return
          state.position = state.items.length - 1
          return
        }
        if (state.position < 1)
          return
        state.position--
      })
    },
    forward () {
      update(state => {
        if (state.position === null)
          return
        if (state.items.length <= (state.position + 1))
          return
        state.position++
      })
    },
    hide() {
      update(state => state.position = null)
    },
    push(image: NoirImage, show: boolean) {
      update(state => {
        state.items.push(image)
        if (show)
          state.position = state.items.length - 1
      })
    },
    reset () {
      update(state => state.position = 0)
    },
  }
}
