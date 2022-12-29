import { type DefaultSession } from 'next-auth'

/** Overwrite NextAuth.js session type, as we also put the user ID on it. */
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id: string
    } & DefaultSession['user']
  }
}
