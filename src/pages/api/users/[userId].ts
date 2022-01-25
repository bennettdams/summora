import { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

export type ApiUser = Prisma.PromiseReturnType<typeof findUser>

async function findUser(userId: string) {
  return await prisma.user.findUnique({
    where: {
      userId,
    },
  })
}

export default async function _apiUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { userId },
    method,
  } = req

  if (!userId) {
    res.status(500).end('No user ID!')
  } else if (typeof userId !== 'string') {
    res.status(500).end('User ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const user: ApiUser = await findUser(userId)
        if (!user) {
          res.status(404).json(`Cannot find user for id ${userId}`)
        } else {
          res.status(200).json(user)
        }
        break
      }
      default: {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
