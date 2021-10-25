import { ApiEndPoint } from './config'


export interface NoirImage {
  file: {
    path: string
  }
  format: string
  dhash?: string
}

export function imageUrl(image: NoirImage): string {
  return `${ApiEndPoint}/file?path=${encodeURIComponent(image.file.path)}`
}
