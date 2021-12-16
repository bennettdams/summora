import Image from 'next/image'
import { ImageUpload } from './ImageUpload'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { useCloudStorage } from '../services/use-cloud-storage'

/*
 * For the love of god, this file is very similar to "PostSegmentImage".
 * This is because I didn't want to build an abstraction YET.
 * If you change something here, change it there as well.
 */

const SIZES = {
  tiny: 25,
  small: 40,
  medium: 100,
  large: 180,
} as const

export type AvatarSize = keyof typeof SIZES

const queryKeyPostBase = 'avatar-image'
type QueryData = string | null

function createQueryKey(userId: string) {
  return [queryKeyPostBase, userId]
}

function useAvatar(hasUserAvatar: boolean, userId: string, size: AvatarSize) {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: refetchQuery,
  } = useQuery<QueryData>(
    createQueryKey(userId),
    async () => {
      const avatarFile = await downloadAvatar(userId)

      if (!avatarFile) {
        throw Error('Avatar file is null')
      } else {
        // FIXME revoke URL to prevent memory leak?
        const url = URL.createObjectURL(avatarFile)

        return url
      }
    },
    {
      // only execute query via "refetch", needed when user uploads a new avatar
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      enabled: false,
    }
  )

  const [sizePixels] = useState(SIZES[size])
  const { downloadAvatar, getPublicURLAvatar } = useCloudStorage()
  const [publicURL] = useState<string | null>(
    !hasUserAvatar ? null : getPublicURLAvatar(userId)
  )

  function handleRefetch() {
    data && URL.revokeObjectURL(data)
    refetchQuery()
  }

  return {
    avatarObjectUrl: data || null,
    refetch: handleRefetch,
    sizePixels,
    publicURL,
    isLoading,
    isError,
    isFetching,
  }
}

function AvatarPlaceholder({
  sizePixels,
}: {
  sizePixels: number
}): JSX.Element {
  return (
    <div
      className="text-center rounded-full inline-flex items-center justify-center bg-gray-200 text-gray-400"
      style={{ width: sizePixels, height: sizePixels }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: sizePixels, height: sizePixels }}
        fill="none"
        viewBox="0 0 24 24"
        transform="scale(0.8)"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  )
}

export function Avatar({
  userId,
  size = 'medium',
  isEditable = false,
  hasUserAvatar = false,
}: {
  userId: string
  size: AvatarSize
  hasUserAvatar: boolean
  isEditable?: boolean
}): JSX.Element {
  const { uploadAvatar } = useCloudStorage()
  const { publicURL, sizePixels, avatarObjectUrl, refetch } = useAvatar(
    hasUserAvatar,
    userId,
    size
  )

  return (
    <div className="relative h-full w-full inline-grid place-items-center">
      {isEditable && (
        <div className="absolute z-30 group h-full w-full hover:cursor-pointer hover:bg-lime-200 rounded-full hover:bg-opacity-50">
          <span className="h-full w-full grid place-items-center invisible group-hover:visible">
            <ImageUpload
              inputId="avatar-upload"
              uploadFn={async (file) => {
                await uploadAvatar(file)
              }}
              onUpload={refetch}
            />
          </span>
        </div>
      )}

      {isEditable && avatarObjectUrl ? (
        <Image
          src={avatarObjectUrl}
          alt="Avatar"
          className="rounded-full"
          width={sizePixels}
          height={sizePixels}
        />
      ) : hasUserAvatar && publicURL ? (
        <Image
          src={publicURL}
          alt="Avatar"
          className="rounded-full"
          width={sizePixels}
          height={sizePixels}
        />
      ) : (
        <AvatarPlaceholder sizePixels={sizePixels} />
      )}
    </div>
  )
}
