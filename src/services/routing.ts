export const ROUTES = {
  home: '/',
  explore: '/explore',
  signIn: '/signin',
  search: '/search',
  about: '/about',
  user: (userId: string) => `/user/${userId}`,
  post: (postId: string) => `/post/${postId}`,
} as const

export const landingPageRoute = ROUTES.home
