import { useRouter } from 'next/router'
import { useFormState } from 'react-hook-form'
import { z } from 'zod'
import { FormDefaultValuesUndefinable, schemaCreatePost } from '../lib/schemas'
import { ROUTES } from '../services/routing'
import { trpc } from '../util/trpc'
import { useZodForm } from '../util/use-zod-form'
import { Button } from './Button'
import { Form, FormFieldError, FormSelect, FormSubmit, Input } from './form'
import { IconEdit } from './Icon'
import { LoadingAnimation } from './LoadingAnimation'
import { Modal, useModal } from './modal'
import { NoContent } from './NoContent'

type SchemaCreatePost = z.infer<typeof schemaCreatePost>

const defaultValuesCreate: FormDefaultValuesUndefinable<
  SchemaCreatePost,
  'categoryId'
> = { title: '', categoryId: undefined }

export function CreatePostModal() {
  const { isOpen, open, close } = useModal()
  const router = useRouter()

  const createPost = trpc.posts.create.useMutation()

  const { handleSubmit, register, reset, control } = useZodForm({
    schema: schemaCreatePost,
    defaultValues: defaultValuesCreate,
    mode: 'onSubmit',
  })
  const { errors } = useFormState({ control })

  const { data: postCategories, isLoading: isLoadingCategories } =
    trpc.postCategories.all.useQuery()

  return (
    <>
      <Button onClick={open} icon={<IconEdit />}>
        Create Post
      </Button>

      <Modal
        isOpen={isOpen}
        close={close}
        title="Create a post"
        forceHalfWidth
        onConfirm={async () => console.log('Confirmed')}
        isSubmit={true}
      >
        <div className="mt-2 text-center">
          <p className="text-sm text-gray-500">
            Give your post a title, subtitle and category to start with!
          </p>
        </div>

        <div className="mx-auto mt-10 mb-10 w-full">
          <Form
            onSubmit={handleSubmit((data) => {
              createPost.mutate(
                {
                  title: data.title,
                  subtitle: data.subtitle,
                  categoryId: data.categoryId,
                },
                {
                  onSuccess: async (result) => {
                    close()
                    reset()
                    await router.push(ROUTES.post(result.id))
                  },
                }
              )
            })}
            className="my-4 flex w-full flex-col space-y-16 px-6 md:px-20"
          >
            <Input
              {...register('title')}
              placeholder="Enter a title.."
              validationErrorMessage={errors.title?.message}
              isSpecial
              small
            />
            <Input
              {...register('subtitle')}
              placeholder="Enter a subtitle.."
              validationErrorMessage={errors.subtitle?.message}
              isSpecial
              small
            />

            {isLoadingCategories ? (
              <LoadingAnimation />
            ) : !postCategories ? (
              <NoContent>No categories</NoContent>
            ) : (
              <>
                <FormSelect
                  control={control}
                  name="categoryId"
                  items={postCategories.map((category) => ({
                    itemId: category.id,
                    label: category.name,
                  }))}
                  validationErrorMessage={errors.categoryId?.message}
                  unselectedLabel="Please select a category."
                />
                <FormFieldError
                  fieldName="general-form-error-key"
                  errors={errors}
                />
              </>
            )}

            <div className="mx-auto">
              <FormSubmit
                isBig={true}
                isInitiallySubmittable={true}
                control={control}
                isLoading={createPost.isLoading}
              >
                Create
              </FormSubmit>
            </div>
          </Form>
        </div>
      </Modal>
    </>
  )
}
