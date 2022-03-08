import Image from 'next/image'
import { ImageUpload } from './ImageUpload'
import { useCloudStorage } from '../services/use-cloud-storage'
import { usePost } from '../data/use-post'
import { useImage } from '../services/use-image'

const queryKeyPostBase = 'post-segment-image'

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
  const { downloadPostSegmentImage, getPublicURLPostSegmentImage } =
    useCloudStorage()
  const { refetch, imageURL } = useImage({
    hasImage: !!imageId,
    imageId,
    queryKey: [queryKeyPostBase, postId, postSegmentId],
    downloadFn: (imageIdNotNull) =>
      downloadPostSegmentImage({
        postId,
        authorId,
        imageId: imageIdNotNull,
      }),
    getPublicImageURL: (imageIdNotNull) =>
      getPublicURLPostSegmentImage({
        postId,
        authorId,
        imageId: imageIdNotNull,
      }),
  })

  return (
    <div className="relative inline-grid h-full w-full place-items-center">
      {isEditable && (
        <div className="group absolute z-30 h-full w-full rounded-full hover:cursor-pointer hover:bg-lime-200 hover:bg-opacity-50">
          <span className="invisible grid h-full w-full place-items-center group-hover:visible">
            <ImageUpload
              inputId={postSegmentId}
              uploadFn={async (file) => {
                await updatePostSegmentImageId({
                  postId,
                  postSegmentId,
                  postSegmentImageFile: file,
                })
                await refetch()
              }}
            />
          </span>
        </div>
      )}

      {imageURL && (
        <Image
          src={imageURL}
          className="rounded-full"
          alt=""
          layout="fill"
          objectFit="contain"
        />
      )}
    </div>
  )
}
