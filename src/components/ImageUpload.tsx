import { ChangeEvent, useState } from 'react'
import { LoadingAnimation } from '../components/LoadingAnimation'
import {
  checkImageFileExtension,
  maxFileSizeInBytes,
  validExtensions,
} from '../services/cloud-service'
import { IconAdd } from './icons'

const validExtensionsBeautified = validExtensions
  .map((extension) => extension.toUpperCase())
  // remove duplicates
  .filter((extension, index, arr) => arr.indexOf(extension) === index)
  .join(' | ')

export function ImageUpload({
  inputId,
  onUpload,
  isLoadingUpload = false,
  isRounded = false,
}: {
  onUpload: (fileToUpload: File) => Promise<void>
  inputId: string
  isLoadingUpload: boolean
  isRounded?: boolean
}): JSX.Element {
  const [isUploading, setIsUploading] = useState(false)
  const [failedUploadMessage, setFailedUploadMessage] = useState<string | null>(
    null
  )
  const isLoading = isLoadingUpload || isUploading
  const isInputDisabled = isLoading

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
          const { fileExtension, isValidImageExtension } =
            checkImageFileExtension(file.type)

          if (!isValidImageExtension) {
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
        className={`grid h-full w-full place-items-center ${
          isInputDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        htmlFor={inputId}
      >
        {isLoading ? (
          <div
            className={`${
              isRounded && 'rounded-full'
            } grid h-full w-full place-items-center bg-dtertiary bg-opacity-80 p-4`}
          >
            <LoadingAnimation />
          </div>
        ) : (
          <IconAdd
            className="rounded-full bg-dtertiary text-white duration-200 group-hover:scale-125 lg:bg-transparent"
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
        disabled={isInputDisabled}
      ></input>
    </form>
  )
}
