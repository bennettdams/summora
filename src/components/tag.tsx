import { useAutoAnimate } from '@formkit/auto-animate/react'
import { useRef, useState } from 'react'
import { useOnClickOutside } from '../util/use-on-click-outside'
import { ButtonAddSpecial } from './Button'
import { IconTrash } from './Icon'
import { NoContent } from './NoContent'

type TagTagslist = {
  tagId: string
  label: string
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
  tags: TagTagslist[] | null
  showAddButton?: boolean
  onAddButtonClick?: () => void
  onRemoveClick?: (tagIdToRemove: string) => void
}): JSX.Element {
  const [animateTagsRef] = useAutoAnimate<HTMLDivElement>()

  return (
    <>
      <div ref={animateTagsRef} className="flex flex-wrap items-center">
        {!tags || tags.length === 0 ? (
          <NoContent>No tags</NoContent>
        ) : (
          tags.map((tag) => (
            <Tag
              key={tag.tagId}
              tag={tag}
              onClick={onRemoveClick}
              handleRemoving={!!onRemoveClick}
            />
          ))
        )}
        {showAddButton && onAddButtonClick && (
          <div className="ml-2 flex flex-row items-center justify-center">
            <ButtonAddSpecial onClick={onAddButtonClick} />
          </div>
        )}
      </div>
    </>
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
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
  const tagRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(tagRef, () => setShowRemoveConfirmation(false))

  return (
    <div
      ref={tagRef}
      className={`m-1 inline rounded bg-dbrown py-0.5 px-1.5 leading-none text-white hover:bg-dorange ${
        onClick && 'cursor-pointer'
      }`}
      key={tag.tagId}
      // Don't execute on click when this tag is supposed to handle removing - this happens further down then.
      onClick={() => !handleRemoving && onClick?.(tag.tagId)}
    >
      {!handleRemoving || !showRemoveConfirmation ? (
        <span
          onClick={() => !!handleRemoving && setShowRemoveConfirmation(true)}
          className="inline-block text-xs uppercase tracking-widest"
        >
          {tag.label}
        </span>
      ) : (
        <div
          className="flex"
          onClick={() => !!handleRemoving && onClick?.(tag.tagId)}
        >
          <IconTrash size="small" />
          <span className="inline-block text-xs font-semibold uppercase tracking-widest">
            Confirm
          </span>
        </div>
      )}
    </div>
  )
}
