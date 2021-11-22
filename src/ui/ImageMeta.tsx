import { useState } from 'react'

import YAML from 'yaml'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEquals } from '@fortawesome/free-solid-svg-icons'

import { NoirImage } from '../image'
import { getFileTags } from '../api'
import { useEffectIfMounted } from '../hook/use-effect-if-mounted'


interface IImageMeta {
  image: NoirImage
  images: number
  onSearch: (string, boolean) => void
}
export default function ImageMeta({image, images, onSearch}: IImageMeta) {
  const [tags, setTags] = useState<null | string[]>(null)

  useEffectIfMounted((ifMounted) => {
    setTags(null)
    getFileTags(image.file.path).then(ifMounted(setTags))
  }, [image.file.path])

  const meta = Object.assign({}, image, tags ? {tags} : {})

  function onClickSimilar() {
    if (!image.dhash)
      return
    onSearch(`dist(dhash, '${image.dhash}') <= 10`, true)
  }

  return (
    <div className="z-30 bg-gray-500 p-2 opacity-90 rounded-md flex flex-col items-center w-full mt-2 hidden lg:flex">
      <div className="flex flex-row items-center mb-1">
        <div>
          <div className="font-bold text-white">
            <span className="mx-2">
              { images } images
            </span>
            {  image.dhash &&
                <button>
                  <FontAwesomeIcon icon={faEquals} onClick={onClickSimilar} />
                </button>
            }
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
