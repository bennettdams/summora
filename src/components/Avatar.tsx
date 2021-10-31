import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useCloudStorage } from '../services/use-cloud-storage'
import { ImageUpload } from './ImageUpload'

const SIZES = {
  small: 40,
  medium: 100,
  large: 180,
} as const

type AvatarSize = keyof typeof SIZES

function AvatarPlaceholder({ size }: { size: AvatarSize }): JSX.Element {
  const [sizePixels] = useState(SIZES[size])
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
  profileId,
  size = 'medium',
  isEditable = false,
}: {
  profileId: string
  size: AvatarSize
  isEditable?: boolean
}): JSX.Element {
  const [sizePixels] = useState(SIZES[size])
  const { downloadAvatar } = useCloudStorage()
  const [avatarObjectUrl, setAvatarObjectUrl] = useState<string | null>(null)

  useEffect(() => {
    async function downloadAvatarImage(path: string) {
      try {
        const avatarFile = await downloadAvatar(path)
        if (!avatarFile) {
          throw Error('Avatar file is null')
        } else {
          // FIXME revoke URL to prevent memory leak?
          const url = URL.createObjectURL(avatarFile)

          setAvatarObjectUrl(url)
        }
      } catch (error) {
        console.error('Error downloading image: ', error)
      }
    }

    downloadAvatarImage(profileId)
  }, [profileId, downloadAvatar])

  return (
    <div className="relative grid place-items-center">
      {isEditable && (
        <div className="absolute z-30 group h-full w-full hover:cursor-pointer hover:bg-lime-200 rounded-full hover:bg-opacity-50">
          <span className="h-full w-full grid place-items-center invisible group-hover:visible">
            <ImageUpload />
          </span>
        </div>
      )}

      {avatarObjectUrl ? (
        <Image
          src={avatarObjectUrl}
          alt="Avatar"
          className="rounded-full"
          width={sizePixels}
          height={sizePixels}
        />
      ) : (
        <AvatarPlaceholder size={size} />
      )}
    </div>
  )
}
