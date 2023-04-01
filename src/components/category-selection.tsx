import type { PostCategoryId } from '@prisma/client'
import { useState, type Dispatch, type SetStateAction } from 'react'
import { trpc } from '../util/trpc'
import { LoadingAnimation } from './LoadingAnimation'
import { NoContent } from './NoContent'

export function useCategorySelectionList() {
  return useState<PostCategoryId[]>([])
}

export function CategorySelectionList({
  selectedIds,
  setSelectedIds,
}: {
  selectedIds: PostCategoryId[]
  setSelectedIds: Dispatch<SetStateAction<PostCategoryId[]>>
}): JSX.Element {
  const {
    data: postCategories,
    isLoading,
    isError,
  } = trpc.postCategories.all.useQuery()

  return (
    <div>
      {isLoading ? (
        <div className="grid place-items-center">
          <LoadingAnimation />
        </div>
      ) : isError ? (
        <NoContent>Error while loading categories.</NoContent>
      ) : !postCategories || postCategories.length === 0 ? (
        <NoContent>No post categories found.</NoContent>
      ) : (
        <div className="grid grid-cols-2 gap-6 text-center text-lg md:grid-cols-4">
          {postCategories.map((category) => (
            <CategorySelectItem
              key={category.id}
              categoryId={category.id}
              categoryName={category.name}
              onClick={(categoryId) =>
                setSelectedIds((prev) => {
                  const isIncluded = prev.includes(categoryId)
                  if (isIncluded) {
                    return prev.filter((prevId) => prevId !== categoryId)
                  } else {
                    return [...prev, categoryId]
                  }
                })
              }
              isSelected={selectedIds.includes(category.id)}
            />
          ))}
        </div>
      )}

      <p className="mt-4 italic">
        Selecting no category means every is included in the filter.
      </p>
    </div>
  )
}

function CategorySelectItem({
  categoryId,
  categoryName,
  isSelected,
  onClick,
}: {
  categoryId: PostCategoryId
  categoryName: string
  isSelected: boolean
  onClick: (categoryId: PostCategoryId) => void
}): JSX.Element {
  return (
    <div
      key={categoryId}
      className={`cursor-pointer rounded-lg border p-2 text-white ring-orange-500 hover:bg-dsecondary active:bg-dprimary/40 ${
        isSelected ? 'bg-dsecondary' : 'bg-dtertiary'
      }`}
      onClick={() => onClick(categoryId)}
    >
      <span>{categoryName}</span>
    </div>
  )
}
