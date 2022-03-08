import Image from 'next/image'
import { ImageUpload } from './ImageUpload'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useCloudStorage } from '../services/use-cloud-storage'
import { usePost } from '../data/use-post'

/*
 * For the love of god, this file is very similar to "Avatar".
 * This is because I didn't want to build an abstraction YET.
 * If you change something here, change it there as well.
 */

const queryKeyPostBase = 'post-segment-image'
type QueryData = string | null

function usePostImage({
  hasImage,
  imageId,
  queryKey,
  downloadFn,
  getPublicImageURL,
}: {
  hasImage: boolean
  postId: string
  postSegmentId: string
  authorId: string
  imageId: string | null
  queryKey: string[]
  downloadFn: (imagIedNotNull: string) => Promise<Blob | null>
  getPublicImageURL: (imagIedNotNull: string) => string | null
}) {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchQuery,
  } = useQuery<QueryData>(
    queryKey,
    async () => {
      if (!imageId) {
        throw Error('Trying to fetch image, but no image ID.')
      } else {
        const imageFileBlob = await downloadFn(imageId)

        if (!imageFileBlob) {
          throw Error('Trying to create objectURL for image, but is null.')
        } else {
          // FIXME revoke URL to prevent memory leak?
          const url = URL.createObjectURL(imageFileBlob)

          return url
        }
      }
    },
    {
      // only execute query via "refetch", needed when user uploads a new post segment image
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled: false,
    }
  )

  // This is only executed in one case: A post segment has rendered that already has an existing image ID.
  const [publicURL] = useState<string | null>(
    !!hasImage && !!imageId ? getPublicImageURL(imageId) : null
  )

  async function handleRefetch() {
    data && URL.revokeObjectURL(data)
    await refetchQuery()
  }

  return {
    refetch: handleRefetch,
    isLoading,
    isError,
    isFetching,
    // local object URL (from editing) has precedence over public URL from database
    imageURL: !data && !publicURL ? null : data ?? publicURL,
  }
}

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
  const { refetch, imageURL } = usePostImage({
    hasImage: !!imageId,
    postId,
    postSegmentId,
    authorId,
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
