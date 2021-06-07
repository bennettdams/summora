import { PostTag } from '.prisma/client'
import { useState } from 'react'

export function Tag({
  tagInitial,
  onRemoveClick,
}: {
  tagInitial: PostTag
  onRemoveClick?: (tagId: string) => void
}): JSX.Element {
  const [tag] = useState(tagInitial)

  return (
    <div
      className="inline m-1"
      key={tag.id}
      onClick={() => onRemoveClick && onRemoveClick(tag.id)}
    >
      <span className="uppercase inline-block py-1 px-2 rounded bg-orange-100 text-orange-800 text-xs font-medium tracking-widest">
        {tag.title}
      </span>
    </div>
  )
}
