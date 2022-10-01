import { useState } from 'react'

export function useImageURL({
  imageId,
  getPublicURL,
}: {
  imageId: string | null
  getPublicURL: (imageIdNotNull: string) => string | null
}) {
  const [imageURL, setImageURL] = useState<string | null>(() => {
    if (!imageId) {
      return null
    } else {
      return getPublicURL(imageId)
    }
  })

  async function replaceImage(newImageId: string | null) {
    if (!newImageId) {
      console.error(
        'Wanted to replace the image URL, but given new image ID is null.'
      )
    } else {
      const newImageURL = getPublicURL(newImageId)

      setImageURL(newImageURL)
    }
  }

  return { imageURL, replaceImage }
}
