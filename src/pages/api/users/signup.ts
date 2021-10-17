import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import {
  ApiUsersSignUpRequestBody,
  ApiUsersSignUpReturn,
} from '../../../services/api'
import { signUpSupabase } from '../../../services/supabase/supabase-service'
import { logAPI } from '../../../util/logger'

interface Request extends NextApiRequest {
  body: ApiUsersSignUpRequestBody
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
        const { user, error } = await signUpSupabase(email, password)
        if (error) {
          console.error('[API] Error while sign up (Supabase):', error)
          return res.status(401).json({ error })
        } else if (user) {
          // TODO if profile creation fails, we have to also delete the user (Supabase)
          const profileCreated = await prisma.profile.create({
            data: {
              userId: user.id,
              username,
            },
          })

          console.log(`[API] signed up ${email}`)

          // using explicit type to make sure we're returning what we've promised in the API function (that called this API endpoint)
          const responseData: ApiUsersSignUpReturn = profileCreated
          return res.status(200).json(responseData)
        }
      } catch (error) {
        console.error('[API] Error while sign up:', error)
        return res.status(401).json({ error })
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
