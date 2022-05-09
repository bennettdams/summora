import { PostCategory } from '@prisma/client'
import { MutableRefObject } from 'react'
import { DropdownItem, DropdownSelect } from './DropdownSelect'
import { IconCategory } from './Icon'

export function CategorySelect({
  categories,
  categoryInitial,
  shouldShowDropdown,
  refExternal,
  onSelect,
}: {
  categories: PostCategory[]
  categoryInitial: PostCategory
  shouldShowDropdown: boolean
  refExternal?: MutableRefObject<HTMLDivElement>
  onSelect: (selectedItem: DropdownItem) => void
}): JSX.Element {
  return (
    <div className="flex items-center text-sm" ref={refExternal}>
      {shouldShowDropdown ? (
        <div className="inline-block w-full">
          <DropdownSelect
            onChange={onSelect}
            items={categories.map((category) => ({
              id: category.id,
              title: category.title,
            }))}
            initialItem={categoryInitial}
          />
        </div>
      ) : (
        <div className="flex items-center text-sm">
          <IconCategory />
          <span className="ml-2 py-1.5">{categoryInitial.title}</span>
        </div>
      )}
    </div>
  )
}
