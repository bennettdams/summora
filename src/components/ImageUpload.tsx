import { ChangeEvent, useState } from 'react'
import { IconAdd } from '../components/Icon'
import { LoadingAnimation } from '../components/LoadingAnimation'

export const validExtensions = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']
// 5 MB
export const maxFileSizeInBytes = 5 * 1024 * 1024

const validExtensionsBeautified = validExtensions
  .map((extension) => extension.toUpperCase())
  // remove duplicates
  .filter((extension, index, arr) => arr.indexOf(extension) === index)
  .join(' | ')

export function ImageUpload({
  inputId,
  onUpload,
  isLoadingUpload = false,
}: {
  onUpload: (fileToUpload: File) => Promise<void>
  inputId: string
  isLoadingUpload: boolean
}): JSX.Element {
  const [isUploading, setIsUploading] = useState(false)
  const [failedUploadMessage, setFailedUploadMessage] = useState<string | null>(
    null
  )

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    try {
      setIsUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        console.error('You must select an image to upload.')
      } else {
        const file = event.target.files[0]

        if (!file) {
          throw new Error('There is no file for your request.')
        } else {
          const fileExtension = file.name.split('.').pop()

          if (!fileExtension || !validExtensions.includes(fileExtension)) {
            setFailedUploadMessage(
              `You provided a ${fileExtension} file, but only the following are allowed: ${validExtensionsBeautified}`
            )
          } else if (file.size > maxFileSizeInBytes) {
            setFailedUploadMessage(
              `File is too big. Please provide a file with max. ${
                maxFileSizeInBytes / 1024 / 1024
              } MB. You provided one with ${Math.round(
                file.size / 1024 / 1024
              )} MB.`
            )
          } else {
            setFailedUploadMessage(null)
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

  const formId = `form-image-upload-${inputId}`

  return (
    <form
      id={formId}
      className="group h-full w-full"
      method="post"
      encType="multipart/form-data"
    >
      <label
        className="grid h-full w-full cursor-pointer place-items-center"
        htmlFor={inputId}
      >
        {isUploading || isLoadingUpload ? (
          <div className="grid h-full w-full place-items-center rounded-full bg-dbrown bg-opacity-80 p-4">
            <LoadingAnimation />
          </div>
        ) : (
          <IconAdd
            className="rounded-full bg-dbrown text-white duration-200 group-hover:scale-125 lg:bg-transparent"
            size="huge"
          />
        )}
      </label>

      {failedUploadMessage && (
        <div>
          <p className="mt-2 rounded bg-red-400 p-2 text-center text-dlight shadow-md">
            {failedUploadMessage}
          </p>
        </div>
      )}

      <input
        type="file"
        id={inputId}
        form={formId}
        className="hidden"
        accept="image/jpg, image/jpeg, image/png"
        onChange={handleUpload}
        disabled={isUploading}
      ></input>
    </form>
  )
}
