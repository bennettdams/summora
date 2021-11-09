import { ChangeEvent, useState } from 'react'
import { useCloudStorage } from '../services/use-cloud-storage'
import { IconAdd } from '../components/Icon'
import { LoadingAnimation } from '../components/LoadingAnimation'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png']

export function ImageUpload({
  onUpload,
}: {
  onUpload?: () => void
}): JSX.Element {
  const { uploadAvatar } = useCloudStorage()
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      } else {
        const file = event.target.files[0]
        const fileExtension = file.name.split('.').pop()

        if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
          throw new Error(
            `You provided a ${fileExtension} file, but only ${ALLOWED_EXTENSIONS} are allowed.`
          )
        } else {
          await uploadAvatar(file)
          onUpload?.()
        }
      }
    } catch (error) {
      throw new Error(`Error while uploading image: ${error}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form
      className="group w-full h-full"
      method="post"
      encType="multipart/form-data"
    >
      <label
        className="w-full h-full grid place-items-center cursor-pointer"
        htmlFor="file-upload"
      >
        {isUploading ? (
          <LoadingAnimation />
        ) : (
          <IconAdd
            className="rotate-45 transition duration-300 group-hover:rotate-90"
            size="huge"
          />
        )}
      </label>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/jpg, image/jpeg, image/png"
        onChange={handleUpload}
        disabled={isUploading}
      ></input>
    </form>
  )
}
