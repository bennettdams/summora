import { ButtonAdd } from './Button'

type TagTagslist = {
  id: string
  title: string
}

export function TagsList({
  tags,
  showAddButton = false,
  onAddClick,
  onRemoveClick,
}: {
  tags: TagTagslist[]
  showAddButton: boolean
  onAddClick: () => void
  onRemoveClick: (tagIdToRemove: string) => void
}): JSX.Element {
  return (
    <div className="flex flex-wrap items-center">
      {tags.map((tag) => (
        <Tag key={tag.id} tag={tag} onClick={onRemoveClick} />
      ))}
      {showAddButton && (
        <div className="flex flex-row items-center justify-center">
          <span className="ml-2">
            <ButtonAdd size="big" onClick={onAddClick} />
          </span>
        </div>
      )}
    </div>
  )
}

export function Tag({
  tag,
  onClick,
}: {
  tag: TagTagslist
  onClick?: (tagId: string) => void
}): JSX.Element {
  return (
    <div
      className={`inline m-1 ${onClick && 'cursor-pointer'}`}
      key={tag.id}
      onClick={() => onClick?.(tag.id)}
    >
      <span className="uppercase inline-block py-1 px-2 rounded bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-medium tracking-widest">
        {tag.title}
      </span>
    </div>
  )
}
