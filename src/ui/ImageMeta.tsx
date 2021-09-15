import { NoirImage } from '../image'


interface IImageMeta {
  image: NoirImage
  images: number
}
export default function ImageMeta({image, images}: IImageMeta) {
  return (
    <div className="z-30 bg-gray-500 p-2 opacity-90 rounded-md flex flex-col items-center w-full mt-2">
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
        defaultValue={JSON.stringify(image, null, '  ')} />
    </div>
  )
}
