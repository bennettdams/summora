// import type { Prisma } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

// export interface ProfileUpdate {
//   profileId: string
//   profileToUpdate: Prisma.ProfileUpdateInput
// }

async function findProfile(profileId: string) {
  try {
    return await prisma.profile.findUnique({
      where: {
        userId: profileId,
      },
    })
  } catch (error) {
    throw new Error(`Error while finding profile: ${error}`)
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

export default async function _profileAPI(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const {
    query: { profileId },
    method,
  } = req

  console.log(
    `[API] ${_profileAPI.name} | ${!profileId ? 'no profile ID' : profileId}`
  )

  if (!profileId) {
    res.status(404).end('No profile ID!')
  } else if (typeof profileId !== 'string') {
    res.status(400).end('Profile ID wrong format!')
  } else {
    switch (method) {
      case 'GET': {
        const profile = await findProfile(profileId)
        if (!profile) {
          res.status(404).json(`Cannot find profile for id ${profileId}`)
        } else {
          res.status(200).json(profile)
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
        res.setHeader('Allow', ['GET', 'PUT'])
        // res.status(405).json({ message: 'Method not allowed' })
        res.status(405).end(`Method ${method} Not Allowed`)
      }
    }
  }
}
