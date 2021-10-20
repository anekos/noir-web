import React from 'react'

import { NoirImage } from '../image'
import Information from './Information'


interface IPath {
  pathPrefix: RegExp
  image: NoirImage
}
export default function ImagePath({pathPrefix, image}: IPath) {
  return (
    <Information className="absolute left-0 bottom-0 max-w-3/7 truncate">
      { image.file.path.replace(pathPrefix, '') }
    </Information>
  )
}
