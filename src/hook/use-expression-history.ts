import {useState, useEffect} from 'react'

import { getHistory, SearchHistory } from '../api'


export default function useExpressionHistory() {
  const [items, setItems] = useState<SearchHistory[]>([])
  const [tick, setTick] = useState<number>(0)

  useEffect(() => {
    getHistory().then(setItems)
  }, [tick])

  function refresh() {
    setTick(it => it + 1)
  }

  return {items, refresh}
}
