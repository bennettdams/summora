import { PostCategory } from '@prisma/client'
import { MutableRefObject } from 'react'
import { trpc } from '../util/trpc'
import { DropdownItem, DropdownSelect } from './DropdownSelect'
import { IconCategory } from './Icon'
import { LoadingAnimation } from './LoadingAnimation'

export function CategorySelect({
  categoryInitial,
  shouldShowDropdown,
  refExternal,
  onSelect,
}: {
  categoryInitial?: PostCategory
  shouldShowDropdown: boolean
  refExternal?: MutableRefObject<HTMLDivElement>
  onSelect: (selectedItem: DropdownItem) => void
}): JSX.Element {
  const { data: postCategories, isLoading } = trpc.postCategories.all.useQuery()

  return (
    <div className="flex items-center text-sm" ref={refExternal}>
      {isLoading ? (
        <LoadingAnimation />
      ) : !postCategories ? (
        <p>No categories</p>
      ) : shouldShowDropdown ? (
        <div className="inline-block w-full">
          <DropdownSelect
            shouldSyncInitialItem={true}
            unselectedLabel="Please select a category."
            onChange={onSelect}
            items={postCategories.map((category) => ({
              itemId: category.id,
              label: category.name,
            }))}
            initialItem={
              !categoryInitial
                ? null
                : { itemId: categoryInitial.id, label: categoryInitial.name }
            }
          />
        </div>
      ) : (
        <div className="flex items-center text-sm">
          <IconCategory />
          <span className="ml-2 py-1.5">
            {!categoryInitial
              ? 'Please select a category'
              : categoryInitial.name}
          </span>
        </div>
      )}
    </div>
  )
}
