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

type ColorVariant = 'brown' | 'orange'

function AvatarPlaceholder({
  sizePixels,
  username,
  variant = 'brown',
}: {
  sizePixels: number
  username: string
  variant?: ColorVariant
}): JSX.Element {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full text-center text-dlight ${
        variant === 'brown' ? 'bg-dbrown' : 'bg-dorange'
      }`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      <p style={{ fontSize: sizePixels * 0.6 }} className="uppercase">
        {username.charAt(0)}
      </p>
    </div>
  )
}

export function Avatar({
  userId,
  username,
  imageId,
  imageBlurDataURL,
  size = 'medium',
  isEditable = false,
  placeholderColorVariant = 'brown',
}: {
  userId: string
  username: string
  imageId: string | null
  imageBlurDataURL: string | null
  size: AvatarSize
  isEditable?: boolean
  placeholderColorVariant?: ColorVariant
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
        <div className="group absolute z-30 h-full w-full rounded-full hover:cursor-pointer hover:bg-dbrown hover:bg-opacity-50">
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
        /*
         * This <div> is only there to cut out a circle around the image, because Next.js' <Image> component
         * does not respect its styling (like: "rounded-full") for the blur placeholder.
         * Next.js v12.1.4
         * See: https://github.com/vercel/next.js/issues/30033
         */
        <div
          className="block overflow-hidden rounded-full"
          style={{
            width: sizePixels,
            height: sizePixels,
          }}
        >
          <Image
            src={imageURL}
            placeholder="blur"
            // Next.js' types don't allow `null`, but they do allow `undefined`
            blurDataURL={imageBlurDataURL ?? undefined}
            className="rounded-full"
            alt="Avatar"
            width={sizePixels}
            height={sizePixels}
          />
        </div>
      ) : (
        <AvatarPlaceholder
          sizePixels={sizePixels}
          username={username}
          variant={placeholderColorVariant}
        />
      )}
    </div>
  )
}
