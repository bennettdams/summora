import { trpc } from '../util/trpc'

export function useUserPosts(userId: string) {
  const { isLoading, data } = trpc.userPosts.byUserId.useQuery({ userId })

  return {
    isLoading,
    posts: data ?? [],
  }
}
