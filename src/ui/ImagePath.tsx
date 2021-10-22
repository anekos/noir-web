import { NoirImage } from '../image'
import Information from './Information'


interface IPath {
  pathPrefix: RegExp
  image: NoirImage
}
export default function ImagePath({pathPrefix, image}: IPath) {
  return (
    <Information className="truncate">
      { image.file.path.replace(pathPrefix, '') }
    </Information>
  )
}
