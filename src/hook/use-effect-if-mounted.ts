import { useEffect } from 'react'


type AnyFunction = (...args: any) => void
type IfMounted<T extends AnyFunction> = (...args: Parameters<T>) => (...args: Parameters<T>) => void
type Body<T extends AnyFunction> = (ifMounted: IfMounted<T>) => void


export function useEffectIfMounted<T extends AnyFunction>(f: Body<T>, watches: any[]) {
  useEffect(() => {
    let isMounted = true
    const _action = (action: (...args: any) => void) => (...args: any) => {
      if (isMounted)
        action(...args)
    }
    f(_action)
    return () => { isMounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, watches)
}
