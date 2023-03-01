import Image from 'next/image'
import {
  generatePublicURLPostSegmentImage,
  uploadPresignedPost,
} from '../services/cloud-service'
import { trpc } from '../util/trpc'
import { ImageUpload } from './ImageUpload'
import { Modal, useModal } from './modal'

/*
 * For the love of god, this file is very similar to "PostSegmentImage".
 * This is because I didn't want to build an abstraction YET.
 * If you change something here, change it there as well.
 */

export function PostSegmentImage({
  postId,
  postSegmentId,
  imageId,
  imageFileExtension,
  isEditable = false,
}: {
  postId: string
  postSegmentId: string
  imageId: string | null
  imageFileExtension: string | null
  isEditable?: boolean
}): JSX.Element {
  const utils = trpc.useContext()
  const imageURL =
    !imageId || !imageFileExtension
      ? null
      : // This implementation assumes that getting the public URL does not need a remote fetch, as this runs on every rerender.
        generatePublicURLPostSegmentImage({
          postId,
          postSegmentId,
          imageId,
          imageFileExtension,
        })

  const modalControls = useModal()

  const imageUploadMutation =
    trpc.imageUpload.getPresignedUrlPostSegmentImage.useMutation()

  return (
    <div
      className={`relative inline-grid h-full w-full place-items-center ${
        !!imageURL && 'cursor-pointer'
      }`}
    >
      {/* TODO use EditOverlay instead */}
      {isEditable && (
        <div className="absolute z-10 h-full w-full rounded-xl hover:cursor-pointer hover:bg-dtertiary hover:bg-opacity-50">
          <span className="grid h-full w-full place-items-center">
            <ImageUpload
              inputId={postSegmentId}
              onUpload={async (fileToUpload) => {
                imageUploadMutation.mutate(
                  {
                    postSegmentId,
                    fileType: fileToUpload.type,
                  },
                  {
                    onSuccess: async (presignedPost) => {
                      await uploadPresignedPost({
                        file: fileToUpload,
                        presignedPost,
                        onSuccess: () => {
                          utils.postSegments.byPostId.invalidate({ postId })
                        },
                      })
                    },
                  }
                )
              }}
              isLoadingUpload={imageUploadMutation.isLoading}
            />
          </span>
        </div>
      )}

      {imageURL && (
        <>
          <Image
            onClick={modalControls.open}
            alt="Segment image"
            src={imageURL}
            fill={true}
            className="object-contain"
            sizes="
            (max-width: 768px) 100vw,
            (max-width: 1200px) 50vw,
            33vw"
            // the following can be used to show a fade-in animation via placeholder, but it will delay when the image is visible
            // placeholder="blur"
            // blurDataURL={imageBlurDataURLFallback}
            // className={`object-contain duration-500 ease-in-out ${
            //   isLoadingImage ? 'blur-xl grayscale' : 'blur-0 grayscale-0'
            // }`}
            // onLoadingComplete={() => setLoadingIsLoadingImage(false)}
          />
          <Modal
            forceFullWidth
            forceFullHeight
            isOpen={modalControls.isOpen}
            close={modalControls.close}
          >
            <div className="relative h-full w-full">
              <Image
                onClick={modalControls.close}
                alt="Segment image"
                src={imageURL}
                fill={true}
                className="object-contain"
                // modal shows the image in full width, so we need the full viewport width
                sizes="100vw"
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  )
}
