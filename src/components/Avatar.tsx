import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useCloudStorage } from '../services/use-cloud-storage'
import { ImageUpload } from './ImageUpload'

const SIZES = {
  small: 40,
  medium: 100,
  large: 180,
} as const

export function Avatar({
  profileId,
  size = 'medium',
  isEditable = false,
}: {
  profileId: string
  size: keyof typeof SIZES
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
        console.error('Error downloading image: ', error.message)
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
        <div
          className="bg-lime-300 rounded-full"
          style={{ height: sizePixels, width: sizePixels }}
        >
          no image
        </div>
      )}
    </div>
  )
}
