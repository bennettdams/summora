import { Prisma } from '@prisma/client'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../prisma/prisma'

export type TagAPI = Exclude<
  Prisma.PromiseReturnType<typeof findSearchTags>,
  null
>[number]

export interface RequestBodyTags {
  searchInput: string
}

async function findSearchTags(searchInput: string) {
  try {
    return await prisma.postTag.findMany({
      where: {
        OR: [
          {
            title: { contains: searchInput, mode: 'insensitive' },
          },
          {
            description: { contains: searchInput, mode: 'insensitive' },
          },
        ],
      },
      orderBy: { posts: { _count: 'desc' } },
    })
  } catch (error) {
    throw new Error(`Error while finding tags: ${error}`)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method, body: requestBody } = req

  console.log('API search tags', method)

  switch (method) {
    case 'POST': {
      const { searchInput }: RequestBodyTags = JSON.parse(requestBody)
      const tags = await findSearchTags(searchInput)
      res.status(200).json(tags)
      break
    }
    default: {
      res.setHeader('Allow', ['PUT'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
