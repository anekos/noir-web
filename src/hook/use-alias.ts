import {useState, useEffect} from 'react'

import { getAliases } from '../api'


export default function useAlias() {
  const [aliases, setAliases] = useState<string[]>([])

  useEffect(() => {
    getAliases().then(setAliases)
  }, [])

  return {aliases}
}
