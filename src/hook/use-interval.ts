import {useState, useEffect} from 'react'


export default function useInterval(interval: number | null, f: any) {
  const [counter, setCounter] = useState<number>(0)

  useEffect(() => {
    if (interval == null) {
      return () => void 0
    }

    const handle = setInterval(() => {
      setCounter((it: number) => it + 1)
      f()
    }, interval * 1000)

    return () => clearInterval(handle)
  }, [interval, f])

  return {counter}
}
