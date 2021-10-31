// import type { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

// export interface ProfileUpdate {
//   profileId: string
//   profileToUpdate: Prisma.ProfileUpdateInput
// }

async function findUser(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: {
        userId,
      },
    })
  } catch (error) {
    throw new Error(`Error while finding user: ${error}`)
  }
}

// async function updateProfile({ profileId, profileToUpdate }: ProfileUpdate) {
//   const now = new Date()

//   if (typeof profileId !== 'string')
//     throw new Error('Profile ID is missing/in the wrong format!')

//   try {
//     return await prisma.profile.update({
//       where: { userId: profileId },
//       data: {
//         updatedAt: now,
//         username: 'benasd',
//       },
//     })
//   } catch (error) {
//     throw new Error(
//       `Error while updating profile with ID ${profileId}: ${error}`
//     )
//   }
// }

export default async function _userAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { userId },
    method,
  } = req

  console.log(`[API] ${_userAPI.name} | ${!userId ? 'no user ID' : userId}`)

  if (!userId) {
    res.status(404).end('No user ID!')
  } else if (typeof userId !== 'string') {
    res.status(400).end('User ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const user = await findUser(userId)
        if (!user) {
          res.status(404).json(`Cannot find user for id ${userId}`)
        } else {
          res.status(200).json(user)
        }
        break
      }
      // case 'PUT': {
      //   // TODO check if profile id === user id from req
      //   const { profileId, profileToUpdate }: ProfileUpdate =
      //     JSON.parse(requestBody)

      //   if (!profileId) {
      //     res.status(404).end('No profile ID!')
      //   } else {
      //     const profileUpdated = await updateProfile({
      //       profileId,
      //       profileToUpdate,
      //     })

      //     res.status(200).json(profileUpdated)
      //   }
      //   break
      // }
      default: {
        res.setHeader('Allow', ['GET'])
        // res.status(405).json({ message: 'Method not allowed' })
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
