import Image from 'next/image'
import { useState } from 'react'
import {
  generatePublicURLAvatar,
  uploadPresignedPost,
} from '../services/cloud-service'
import { trpc } from '../util/trpc'
import { ImageUpload } from './ImageUpload'

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

type AvatarSize = keyof typeof SIZES

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
        variant === 'brown' ? 'bg-dtertiary' : 'bg-dsecondary'
      }`}
      style={{ width: sizePixels, height: sizePixels }}
    >
      <p style={{ fontSize: sizePixels * 0.6 }} className="uppercase">
        {username.charAt(0)}
      </p>
    </div>
  )
}

type Props = {
  userId: string
  username: string
  imageId: string | null
  imageBlurDataURL: string | null
  imageFileExtension: string | null
  size: AvatarSize
  isEditable?: boolean
  placeholderColorVariant?: ColorVariant
}

export function Avatar(props: Props): JSX.Element {
  // image ID as key to be sure to throw the component away when changing the image
  return <AvatarInternal key={props.imageId} {...props} />
}

function AvatarInternal({
  userId,
  username,
  imageId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  imageBlurDataURL,
  imageFileExtension,
  size = 'medium',
  isEditable = false,
  placeholderColorVariant = 'brown',
}: Props): JSX.Element {
  const [sizePixels] = useState(SIZES[size])
  const imageURL =
    !imageId || !imageFileExtension
      ? null
      : // This implementation assumes that getting the public URL does not need a remote fetch, as this runs on every rerender.
        generatePublicURLAvatar({
          userId,
          imageId,
          imageFileExtension,
        })

  const utils = trpc.useContext()

  const avatarUploadMutation =
    trpc.imageUpload.getPresignedUrlAvatar.useMutation()

  return (
    <div className="relative inline-grid h-full w-full place-items-center">
      {/* TODO use EditOverlay instead */}
      {isEditable && (
        <div className="group absolute z-30 h-full w-full rounded-full hover:cursor-pointer hover:bg-dtertiary hover:bg-opacity-50">
          <span className="grid h-full w-full place-items-center">
            <ImageUpload
              inputId={userId}
              onUpload={async (fileToUpload) => {
                avatarUploadMutation.mutate(
                  {
                    fileType: fileToUpload.type,
                  },
                  {
                    onSuccess: async (presignedPost) => {
                      await uploadPresignedPost({
                        file: fileToUpload,
                        presignedPost,
                        onSuccess: () => {
                          // USER DATA
                          utils.user.byUserId.invalidate({ userId })

                          // POSTS DATA
                          utils.posts.invalidate()
                        },
                      })
                    },
                  }
                )
              }}
              isLoadingUpload={avatarUploadMutation.isLoading}
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
          className="relative block overflow-hidden rounded-full"
          style={{
            width: sizePixels,
            height: sizePixels,
          }}
        >
          <Image
            src={imageURL}
            alt="Avatar"
            height={sizePixels}
            width={sizePixels}
            style={{ objectFit: 'cover' }}
            className="rounded-full"
            // the following can be used to show a fade-in animation via placeholder, but it will delay when the image is visible
            // placeholder="blur"
            // blurDataURL={imageBlurDataURL ?? imageBlurDataURLFallback}
            // className={`rounded-full duration-75 ease-in-out ${
            //   isLoadingImage ? 'blur-2xl grayscale' : 'blur-0 grayscale-0'
            // }`}
            // onLoadingComplete={() => setLoadingIsLoadingImage(false)}
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
