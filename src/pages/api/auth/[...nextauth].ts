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
      const email = user.email

      const allowedMailAdressesRaw = process.env.ALLOWED_MAIL_ADRESSES

      if (
        !!email &&
        !!allowedMailAdressesRaw &&
        allowedMailAdressesRaw.split(',').includes(email)
      ) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
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
