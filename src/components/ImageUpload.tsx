import { ChangeEvent, useState } from 'react'
import { IconAdd } from '../components/Icon'
import { LoadingAnimation } from '../components/LoadingAnimation'

export const validExtensions = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']

export function ImageUpload({
  inputId,
  onUpload,
}: {
  onUpload: (fileToUpload: File) => Promise<void>
  inputId: string
}): JSX.Element {
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      } else {
        const file = event.target.files[0]

        if (!file) {
          throw new Error('There is no file for your request.')
        } else {
          const fileExtension = file.name.split('.').pop()

          if (!fileExtension || !validExtensions.includes(fileExtension)) {
            throw new Error(
              `You provided a ${fileExtension} file, but only ${validExtensions} are allowed.`
            )
          } else {
            await onUpload(file)
          }
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
      id={`form-image-upload-${inputId}`}
      className="group h-full w-full"
      method="post"
      encType="multipart/form-data"
    >
      <label
        className="grid h-full w-full cursor-pointer place-items-center"
        htmlFor={inputId}
      >
        {isUploading ? (
          <div className="grid h-full w-full place-items-center rounded-full bg-dbrown bg-opacity-80 p-4">
            <LoadingAnimation />
          </div>
        ) : (
          <IconAdd className="duration-200 group-hover:scale-125" size="huge" />
        )}
      </label>

      <input
        type="file"
        id={inputId}
        className="hidden"
        accept="image/jpg, image/jpeg, image/png"
        onChange={handleUpload}
        disabled={isUploading}
      ></input>
    </form>
  )
}
