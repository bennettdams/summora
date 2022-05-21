export const ROUTES = {
  home: '/',
  explore: '/explore',
  signIn: '/signin',
  user: (userId: string) => `/user/${userId}`,
  post: (postId: string) => `/post/${postId}`,
} as const
