import { useState } from 'react'
import { TagPostPage } from './PostPage'

export function Tag({
  tagInitial,
  onClick,
}: {
  tagInitial: TagPostPage
  onClick?: (tag: TagPostPage) => void
}): JSX.Element {
  const [tag] = useState(tagInitial)

  return (
    <div
      className={`inline m-1 ${onClick && 'cursor-pointer'}`}
      key={tag.id}
      onClick={() => onClick && onClick(tag)}
    >
      <span className="uppercase inline-block py-1 px-2 rounded bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-medium tracking-widest">
        {tag.title}
      </span>
    </div>
  )
}
