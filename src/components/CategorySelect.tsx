import { PostCategory } from '@prisma/client'
import { MutableRefObject } from 'react'
import { usePostCategories } from '../data/use-post-categories'
import { DropdownItem, DropdownSelect } from './DropdownSelect'
import { IconCategory } from './Icon'

/**
 * Wherever this component is used, it would be wise to fill the cache
 * on the client with the categories, so the data hook does not need to fetch
 * it on the client.
 */
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
  const { postCategories } = usePostCategories()

  return (
    <div className="flex items-center text-sm" ref={refExternal}>
      {shouldShowDropdown ? (
        <div className="inline-block w-full">
          <DropdownSelect
            onChange={onSelect}
            items={postCategories.map((category) => ({
              id: category.id,
              title: category.title,
            }))}
            initialItem={categoryInitial}
          />
        </div>
      ) : (
        <div className="flex items-center text-sm">
          <IconCategory />
          <span className="ml-2 py-1.5">
            {!categoryInitial
              ? 'Please select a category'
              : categoryInitial.title}
          </span>
        </div>
      )}
    </div>
  )
}
