import Image from 'next/image'
import { ImageUpload } from './ImageUpload'
import { useState } from 'react'
import { useCloudStorage } from '../services/use-cloud-storage'
import { useUser } from '../data/use-user'
import { useImage } from '../services/use-image'

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

function AvatarPlaceholder({
  sizePixels,
}: {
  sizePixels: number
}): JSX.Element {
  return (
    <div
      className="inline-flex items-center justify-center rounded-full bg-gray-200 text-center text-gray-400"
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
  imageId,
  size = 'medium',
  isEditable = false,
}: {
  userId: string
  imageId: string | null
  size: AvatarSize
  isEditable?: boolean
}): JSX.Element {
  const [sizePixels] = useState(SIZES[size])
  const { updateUserImageId } = useUser(userId)
  const { downloadAvatar, getPublicURLAvatar } = useCloudStorage()
  const { refetch, imageURL } = useImage({
    hasImage: !!imageId,
    imageId,
    queryKey: [queryKeyPostBase, userId],
    downloadFn: (imageIdNotNull) =>
      downloadAvatar({
        userId,
        imageId: imageIdNotNull,
      }),
    getPublicImageURL: (imageIdNotNull) =>
      getPublicURLAvatar({
        userId,
        imageId: imageIdNotNull,
      }),
  })

  return (
    <div className="relative inline-grid h-full w-full place-items-center">
      {isEditable && (
        <div className="group absolute z-30 h-full w-full rounded-full hover:cursor-pointer hover:bg-lime-200 hover:bg-opacity-50">
          <span className="invisible grid h-full w-full place-items-center group-hover:visible">
            <ImageUpload
              inputId={userId}
              uploadFn={async (file) => {
                await updateUserImageId(file)
                await refetch()
              }}
            />
          </span>
        </div>
      )}

      {imageURL ? (
        <Image
          src={imageURL}
          className="rounded-full"
          alt="Avatar"
          width={sizePixels}
          height={sizePixels}
        />
      ) : (
        <AvatarPlaceholder sizePixels={sizePixels} />
      )}
    </div>
  )
}
