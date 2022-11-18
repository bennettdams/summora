import { useMutation } from '@tanstack/react-query'
import Image from 'next/image'
import { apiImageUploadPostSegments } from '../services/api-service'
import { useCloudStorage } from '../services/use-cloud-storage'
import { trpc } from '../util/trpc'
import { ImageUpload } from './ImageUpload'
import { Modal, useModal } from './modal'

export function PostSegmentImage({
  postId,
  authorId,
  postSegmentId,
  imageId,
  isEditable = false,
}: {
  postId: string
  authorId: string
  postSegmentId: string
  imageId: string | null
  isEditable?: boolean
}): JSX.Element {
  const utils = trpc.useContext()
  const updatePostSegmentImageIdMutation = useMutation({
    mutationFn: apiImageUploadPostSegments,
    onSuccess: () => {
      utils.postSegments.byPostId.invalidate({ postId })
    },
  })
  const { getPublicURLPostSegmentImage } = useCloudStorage()
  const imageURL = !imageId
    ? null
    : // This implementation assumes that getting the public URL does not need a remote fetch, as this runs on every rerender.
      getPublicURLPostSegmentImage({
        postId,
        authorId,
        imageId,
      })

  const modalControls = useModal()

  return (
    <div
      className={`relative inline-grid h-full w-full place-items-center ${
        !!imageURL && 'cursor-pointer'
      }`}
    >
      {/* TODO use EditOverlay instead */}
      {isEditable && (
        <div className="absolute z-10 h-full w-full rounded-xl hover:cursor-pointer hover:bg-dbrown hover:bg-opacity-50">
          <span className="grid h-full w-full place-items-center">
            <ImageUpload
              inputId={postSegmentId}
              onUpload={async (fileToUpload) => {
                updatePostSegmentImageIdMutation.mutate({
                  postId,
                  postSegmentId,
                  postSegmentImageFile: fileToUpload,
                })
              }}
              isLoadingUpload={updatePostSegmentImageIdMutation.isLoading}
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
