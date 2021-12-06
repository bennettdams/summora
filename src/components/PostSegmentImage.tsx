import Image from 'next/image'
import { ImageUpload } from './ImageUpload'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useCloudStorage } from '../services/use-cloud-storage'

/*
 * For the love of god, this file is very similar to "Avatar".
 * This is because I didn't want to build an abstraction YET.
 * If you change something here, change it there as well.
 */

const queryKeyPostBase = 'post-segment-image'
type QueryData = string | null

function createQueryKey(postId: string, postSegmentId: string) {
  return [queryKeyPostBase, postId, postSegmentId]
}

function usePostImage(postId: string, postSegmentId: string) {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchQuery,
  } = useQuery<QueryData>(
    createQueryKey(postId, postSegmentId),
    async () => {
      const postSegmentImageFile = await downloadPostSegmentImage(
        postId,
        postSegmentId
      )

      if (!postSegmentImageFile) {
        throw Error('Post segment image file is null')
      } else {
        // FIXME revoke URL to prevent memory leak?
        const url = URL.createObjectURL(postSegmentImageFile)

        return url
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

  const { downloadPostSegmentImage, getPublicURLPostSegmentImage } =
    useCloudStorage()
  const [publicURL] = useState(
    getPublicURLPostSegmentImage(postId, postSegmentId)
  )

  function handleRefetch() {
    data && URL.revokeObjectURL(data)
    refetchQuery()
  }

  return {
    postSegmentImageObjectUrl: data || null,
    refetch: handleRefetch,
    publicURL,
    isLoading,
    isError,
    isFetching,
  }
}

export function PostSegmentImage({
  postId,
  postSegmentId,
  hasSegmentImage = false,
  isEditable = false,
}: {
  postId: string
  postSegmentId: string
  hasSegmentImage: boolean
  isEditable?: boolean
}): JSX.Element {
  const { uploadPostSegmentImage } = useCloudStorage()
  const { publicURL, postSegmentImageObjectUrl, refetch } = usePostImage(
    postId,
    postSegmentId
  )

  return (
    <div className="relative h-full w-full inline-grid place-items-center">
      {isEditable && (
        <div className="absolute z-30 group h-full w-full hover:cursor-pointer hover:bg-lime-200 rounded-full hover:bg-opacity-50">
          <span className="h-full w-full grid place-items-center invisible group-hover:visible">
            <ImageUpload
              uploadFn={async (file) => {
                await uploadPostSegmentImage(postId, postSegmentId, file)
              }}
              onUpload={refetch}
            />
          </span>
        </div>
      )}

      {isEditable && postSegmentImageObjectUrl ? (
        <Image
          src={postSegmentImageObjectUrl}
          className="rounded-full"
          alt=""
          // width="100%"
          // height="100%"
          layout="fill"
          objectFit="contain"
        />
      ) : (
        hasSegmentImage &&
        publicURL && (
          <Image
            src={publicURL}
            className="rounded-3xl"
            alt=""
            // width="100%"
            // height="100%"
            layout="fill"
            objectFit="contain"
          />
        )
      )}
    </div>
  )
}
