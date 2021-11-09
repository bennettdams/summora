import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { ApiUsersSignUpRequestBody } from '../../../services/api-service'
import { signUp } from '../../../services/auth-service'
import { deleteUser } from '../../../services/user-service'
import { logAPI } from '../../../util/logger'

interface Request extends NextApiRequest {
  body: ApiUsersSignUpRequestBody
}

export type ApiUsersSignUp = Prisma.PromiseReturnType<typeof createUser>

async function createUser(userId: string, username: string) {
  return await prisma.user.create({
    data: {
      userId,
      username,
    },
  })
}

export default async function _usersSignUpAPI(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req

  logAPI('USERS_SIGN_UP', method)

  switch (method) {
    case 'POST': {
      const { username, email, password } = requestBody

      try {
        const usernameAlreadyExists = await prisma.user.findUnique({
          where: { username },
        })

        /*
         * This check is just an early exit, the real check for unique usernames
         * is done via constraint in the database.
         */
        if (usernameAlreadyExists) {
          const message = `[API] Username ${username} already exists, not trying to create a user.`
          console.warn(message)
          return res.status(409).json({ message })
        } else {
          const { user, error } = await signUp(email, password)
          if (error) {
            console.error('[API] Error while sign up (Supabase):', error)
            return res.status(500).json({ error })
          } else if (user) {
            const userId = user.id
            let userCreated

            try {
              userCreated = await prisma.user.create({
                data: {
                  userId,
                  username,
                },
              })
            } catch (error) {
              console.error('[API] Error while creating user:', error)

              console.error(`[API] Deleting user ${userId}`)
              await deleteUser(userId)

              throw new Error('[API] Error while creating user (Prisma)')
            }

            console.info(`[API] signed up ${username}`)

            // using explicit type to make sure we're returning what we've promised in the API function (that called this API endpoint)
            const responseData: ApiUsersSignUp = userCreated
            return res.status(200).json(responseData)
          }
        }
      } catch (error) {
        console.error('[API] Error while sign up:', error)
        return res.status(500).json({ error })
      }
      break
    }
    default: {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
      break
    }
  }
}
