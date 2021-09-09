import {useState, useEffect} from 'react'


export function useLocalStorage<T>(key: string, defaultValue: T) {
  const fullKey = `noir-${key}`
  const [state, setState] = useState(() => {
    const got = localStorage.getItem(fullKey)
    if (got)
      return JSON.parse(got)
    return defaultValue
  })
  useEffect(() => {
    localStorage.setItem(fullKey, JSON.stringify(state))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return [state, setState]
}
