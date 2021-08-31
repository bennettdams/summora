import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'
import { ReturnApiUsersSignUp, ROUTES_API } from '../../../services/api'
import { signUpSupabase } from '../../../services/supabase/supabase-service'

interface Request extends NextApiRequest {
  body: { email: string; password: string }
}

export default async function handler(
  req: Request,
  res: NextApiResponse
): Promise<void> {
  console.log(`[API] ${ROUTES_API.USERS_SIGN_UP}`)
  const { body: requestBody, method } = req

  switch (method) {
    case 'POST': {
      const { email, password } = requestBody

      try {
        const { user, error } = await signUpSupabase(email, password)
        if (error) {
          console.error('[API] Error while sign up (Supabase):', error)
          return res.status(401).json({ error })
        } else if (user) {
          const profileCreated = await prisma.profile.create({
            data: {
              userId: user.id,
              username: 'username fallback' + Math.random(),
            },
          })

          console.log(`[API] signed up ${email}`)

          const responseData: ReturnApiUsersSignUp = profileCreated
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
