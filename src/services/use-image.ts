import { QueryKey, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type QueryData = string | null

export function useImage(
  imageId: string | null,
  {
    hasImage,
    queryKey,
    downloadFn,
    getPublicImageURL,
  }: {
    hasImage: boolean
    queryKey: QueryKey
    downloadFn: (imagIedNotNull: string) => Promise<Blob | null>
    getPublicImageURL: (imagIedNotNull: string) => string | null
  }
) {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchQuery,
  } = useQuery<QueryData>(
    [queryKey, imageId],
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
      // only execute query via "refetch", needed when user uploads a new image
      keepPreviousData: false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled: false,
    }
  )

  // This is only executed in one case: The consumer has rendered that already has an existing image ID.
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
