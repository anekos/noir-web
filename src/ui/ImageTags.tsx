import { useEffect, Fragment, useState } from 'react'

import { getFileTags, replaceTag } from '../api'
import Information from './Information'


interface ITags {
  path: string
  expression: string,
  onSearch: (expression: string) => void
}
export default function ImageTags({expression, path, onSearch}: ITags) {
  const [tags, setTags] = useState<null | string[]>(null)

  useEffect(() => {
    setTags(null)
    getFileTags(path).then(setTags)
  }, [path])

  if (tags === null || tags.length === 0)
    return (<></>)

  function onClick(tag) {
    return async function () {
      let replaced = await replaceTag(expression, tag)
      if (replaced === null) {
        onSearch(`#${tag} and ${expression}`)
      } else {
        onSearch(replaced)
      }
    }
  }

  return (
    <Information className="extend-on-hover">
      { tags.map((tag, index) => (
        <Fragment key={index}>
          <span
            onClick={onClick(tag)}
            className="hover:bg-gray-200 hover:text-indigo-900 cursor-pointer">
              <span className="font-bold">{ tag[0] }</span>
              <span>{ tag.slice(1) }</span>
            </span>
            &nbsp;
          </Fragment>
      ))}
    </Information>
  )
}

