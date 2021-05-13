interface PostTag {
  id: string
  title: string
  description: string
}

interface PostCategory {
  id: string
  title: string
  description: string
}

export const postCategories: PostCategory[] = [
  { id: 'books', title: 'Books', description: '..' },
  { id: 'movies', title: 'Movies', description: '..' },
  { id: 'series', title: 'Series', description: '..' },
  { id: 'music', title: 'Music', description: '..' },
  { id: 'gaming', title: 'Gaming', description: '..' },
  { id: 'pc-electronics', title: 'PC & Electronics', description: '..' },
  { id: 'household', title: 'Electronic', description: '..' },
  { id: 'animals', title: 'Animals', description: '..' },
  { id: 'nature', title: 'Nature', description: '..' },
  { id: 'beauty', title: 'Beauty', description: '..' },
  { id: 'vehicles', title: 'Vehicles', description: '..' },
  { id: 'food-drinks', title: 'Food & drinks', description: '..' },
  { id: 'education', title: 'Education', description: '..' },
  { id: 'babys', title: 'Babys', description: '..' },
  { id: 'fashion', title: 'Fashion', description: '..' },
  { id: 'sports', title: 'Sports', description: '..' },
]

export const postTags: PostTag[] = [
  { id: 'tutorial', title: 'Tutorial', description: '..' },
  { id: 'summary', title: 'Summary', description: '..' },
  { id: 'how-to', title: 'How-to', description: '..' },
  { id: 'knowledge', title: 'Knowledge', description: '..' },
  { id: 'legal', title: 'Legal', description: '..' },
  {
    id: 'everyday life',
    title: 'Everyday life',
    description: '..',
  },
  { id: 'for dummies', title: 'For dummies', description: '..' },
  { id: 'history', title: 'History', description: '..' },
]
