import { useState } from 'react'
import { ButtonAdd } from './Button'
import { IconTrash } from './Icon'

type TagTagslist = {
  id: string
  title: string
}

/**
 * TODO "onLinkClick" or something that leads to /explore with prefilter
 */
export function TagsList({
  tags,
  showAddButton = false,
  onAddButtonClick,
  onRemoveClick,
}: {
  tags: TagTagslist[]
  showAddButton?: boolean
  onAddButtonClick?: () => void
  onRemoveClick?: (tagIdToRemove: string) => void
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center">
      {tags.map((tag) => (
        <Tag
          key={tag.id}
          tag={tag}
          onClick={onRemoveClick}
          handleRemoving={!!onRemoveClick}
        />
      ))}
      {showAddButton && onAddButtonClick && (
        <div className="flex flex-row items-center ml-2 justify-center">
          <ButtonAdd onClick={onAddButtonClick} />
        </div>
      )}
    </div>
  )
}

export function Tag({
  tag,
  onClick,
  handleRemoving = false,
}: {
  tag: TagTagslist
  onClick?: (tagId: string) => void
  /**
   * Use to handle removing on click with confirmation.
   */
  handleRemoving?: boolean
}): JSX.Element {
  const [showRemove, setShowRemove] = useState(false)

  return (
    <div
      className={`inline m-1 py-0.5 px-1.5 leading-none rounded bg-orange-100 hover:bg-orange-200 text-orange-800 ${
        onClick && 'cursor-pointer'
      }`}
      key={tag.id}
      // Don't execute on click when this tag is supposed to handle removing - this happens further down then.
      onClick={() => !handleRemoving && onClick?.(tag.id)}
    >
      {!handleRemoving || !showRemove ? (
        <span
          onClick={() => !!handleRemoving && setShowRemove(true)}
          className="uppercase inline-block text-xs font-medium tracking-widest"
        >
          {tag.title}
        </span>
      ) : (
        <div
          className="flex"
          onClick={() => !!handleRemoving && onClick?.(tag.id)}
        >
          <IconTrash size="small" />
          <span className="uppercase inline-block text-xs font-medium tracking-widest">
            Confirm
          </span>
        </div>
      )}
    </div>
  )
}
