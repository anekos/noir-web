import { useEffect, useState } from 'react'

import { getFileTags } from '../api'
import Information from './Information'


interface ITags {
  path: string
  onSearch: (expression: string) => void
}
export default function ImageTags({path, onSearch}: ITags) {
  const [tags, setTags] = useState<null | string[]>(null)

  useEffect(() => {
    setTags(null)
    getFileTags(path).then(setTags)
  }, [path])

  if (tags === null || tags.length === 0)
    return (<></>)

  return (
    <Information className="extend-on-hover">
      { tags.map((tag, index) => (
          <span
            key={index}
            className="mr-1 hover:bg-gray-200 hover:text-indigo-900 cursor-pointer"
            onClick={() => onSearch(`#${tag}`)}
          >
            { tag }
          </span>
      ))}
    </Information>
  )
}

