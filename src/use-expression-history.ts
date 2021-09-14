import { useLocalStorage } from './use-local-storage'


export default function useExpressionHistory() {
  const [items, setItems] = useLocalStorage<string[]>('expression-history', [])

  function push(expression: string) {
    const e = expression.trim()
    const newItems: string[] = items.filter(it => e !== it)
    newItems.unshift(e)
    setItems(newItems)
  }

  return {push, items}
}

