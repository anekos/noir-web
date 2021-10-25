import { useState } from 'react'

import YAML from 'yaml'

import { NoirImage } from '../image'
import { getFileTags } from '../api'
import { useEffectIfMounted } from '../use-effect-if-mounted'


interface IImageMeta {
  image: NoirImage
  images: number
}
export default function ImageMeta({image, images}: IImageMeta) {
  const [tags, setTags] = useState<null | string[]>(null)

  useEffectIfMounted((ifMounted) => {
    setTags(null)
    getFileTags(image.file.path).then(ifMounted(setTags))
  }, [image.file.path])

  const meta = Object.assign({}, image, tags ? {tags} : {})

  return (
    <div className="z-30 bg-gray-500 p-2 opacity-90 rounded-md flex flex-col items-center w-full mt-2 hidden xl:flex">
      <div className="flex flex-row items-center mb-1">
        <div>
          <div className="font-bold text-white">
            { images } images
          </div>
        </div>
      </div>

      <textarea
        className="w-full bg-gray-300"
        rows={12}
        wrap="off"
        readOnly={true}
        value={YAML.stringify(meta, {indent: 2})} />
    </div>
  )
}
