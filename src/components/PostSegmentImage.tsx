import Image from 'next/image'
import { usePost } from '../data/use-post'
import { useCloudStorage } from '../services/use-cloud-storage'
import { useImageURL } from '../services/use-image-url'
import { ImageUpload } from './ImageUpload'

export function PostSegmentImage({
  postId,
  authorId,
  postSegmentId,
  imageId,
  isEditable = false,
}: {
  postId: string
  authorId: string
  postSegmentId: string
  imageId: string | null
  isEditable?: boolean
}): JSX.Element {
  const { updatePostSegmentImageId } = usePost(postId)
  const { getPublicURLPostSegmentImage } = useCloudStorage()
  const { imageURL, replaceImage } = useImageURL({
    imageId,
    getPublicURL: (imageIdNotNull) =>
      getPublicURLPostSegmentImage({
        postId,
        authorId,
        imageId: imageIdNotNull,
      }),
  })

  return (
    <div className="relative inline-grid h-full w-full place-items-center">
      {isEditable && (
        <div className="absolute z-10 h-full w-full rounded-xl hover:cursor-pointer hover:bg-dbrown hover:bg-opacity-50">
          <span className="grid h-full w-full place-items-center">
            <ImageUpload
              inputId={postSegmentId}
              onUpload={async (fileToUpload) => {
                await updatePostSegmentImageId(
                  {
                    postId,
                    postSegmentId,
                    postSegmentImageFile: fileToUpload,
                  },
                  {
                    onSuccess: async (data) => {
                      replaceImage(data.result?.imageId ?? null)
                    },
                  }
                )
              }}
            />
          </span>
        </div>
      )}

      {imageURL && (
        <Image src={imageURL} alt="" layout="fill" objectFit="contain" />
      )}
    </div>
  )
}
