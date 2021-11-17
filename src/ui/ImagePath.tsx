import { NoirImage } from '../image'
import Information from './Information'


interface IPath {
  pathPrefix: RegExp
  image: NoirImage
}
export default function ImagePath({pathPrefix, image}: IPath) {
  return (
    <Information className="noir-snipper">
      <span className="snipped">
        { image.file.path.replace(pathPrefix, '') }
      </span>
      <span className="not-snipped">
        { image.file.path }
      </span>
    </Information>
  )
}
