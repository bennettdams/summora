import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { DbFindUser, dbFindUser } from '../../../../lib/db'
import { ApiUserUpdateRequestBody } from '../../../../services/api-service'
import { getUserByCookie } from '../../../../services/auth-service'

export type ApiUser = DbFindUser

export type ApiUserUpdate = Prisma.PromiseReturnType<typeof updateUser>

async function updateUser({
  userId,
  userToUpdate,
}: {
  userId: string
  userToUpdate: ApiUserUpdateRequestBody
}) {
  try {
    return await prisma.user.update({
      where: { userId },
      data: {
        donationLinks: userToUpdate.donationLinks,
      },
    })
  } catch (error) {
    throw new Error(`Error while updating user with ID ${userId}: ${error}`)
  }
}

export default async function _apiUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { userId },
    body: requestBody,
    method,
  } = req

  if (!userId) {
    res.status(500).end('No user ID!')
  } else if (typeof userId !== 'string') {
    res.status(500).end('User ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const user: ApiUser = await dbFindUser(userId)
        if (!user) {
          res.status(404).json(`Cannot find user for id ${userId}`)
        } else {
          res.status(200).json(user)
        }
        break
      }
      case 'PUT': {
        const user = await getUserByCookie(req)
        const userIdAuth = user.userAuth?.id

        if (!userIdAuth) {
          res.status(401).end('Unauthenticated!')
        } else if (userIdAuth !== userId) {
          res.status(403).end('Not authorized for changing this user.')
        } else {
          // TODO parse
          const userToUpdate: ApiUserUpdateRequestBody = requestBody

          const userUpdated: ApiUserUpdate = await updateUser({
            userId,
            userToUpdate,
          })

          res.status(200).json(userUpdated)
        }

        break
      }
      default: {
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
