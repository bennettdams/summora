import { UserPageProps } from '../pages/user/[userId]'

export function serialize<TDataSerialize>(
  data: TDataSerialize
): TDataSerialize {
  return JSON.parse(JSON.stringify(data))
}

export function deserializeUserPosts(
  posts: UserPageProps['posts']
): UserPageProps['posts'] {
  return posts.map((post) => ({ ...post, updatedAt: new Date(post.updatedAt) }))
}
