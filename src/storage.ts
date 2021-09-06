function prefixed(name: string): string {
  return `noir-${name}`
}

function get<T>(name: string, defaultValue: T): T {
  const value = localStorage.getItem(prefixed(name))
  if (value === null)
    return defaultValue
  return JSON.parse(value) as T
}

function set<T>(name: string, value: T) {
  localStorage.setItem(prefixed(name), JSON.stringify(value))
}

const Storage = { get, set }

export default Storage
