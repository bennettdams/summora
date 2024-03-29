import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '../../../server/db/client'

export const authOptions: NextAuthOptions = {
  // include user.id on session
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    async signIn({ user }) {
      const isSignInActiveRaw = process.env.NEXT_PUBLIC_IS_SIGN_IN_ACTIVE
      const isSignInActive = Boolean(isSignInActiveRaw)

      if (isSignInActive) {
        return true
      } else {
        const email = user.email
        const adminMailAdressesRaw = process.env.ADMIN_MAIL_ADRESSES
        const adminMailAdresses = adminMailAdressesRaw?.split(',')

        // admins are always allowed to sign in/sign up
        if (
          !!email &&
          !!adminMailAdresses &&
          adminMailAdresses.includes(email)
        ) {
          return true
        } else {
          return false
          // could also return an URL to redirect to
          // return '/unauthorized'
        }
      }
    },
  },
  pages: {
    signIn: '/signin',
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientId: process.env.GOOGLE_CLIENT_ID!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
}

export default NextAuth(authOptions)
