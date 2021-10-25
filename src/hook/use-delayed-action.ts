import { useRef } from 'react'


interface IUseDelayActionResult {
  cancel: () => void
  fire: (msec: number, action: () => void) => void
}
export function useDelayedAction(): IUseDelayActionResult {
  const handle = useRef<NodeJS.Timeout | null>(null)

  function cancel() {
    if (handle.current)
      clearTimeout(handle.current)
  }

  function fire(msec: number, action: () => void) {
    cancel()
    handle.current = setTimeout(action, msec)
  }

  return { cancel, fire }
}
