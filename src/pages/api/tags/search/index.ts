import type { NextApiRequest, NextApiResponse } from 'next'

import { Prisma } from '@prisma/client'
import { logAPI } from '../../../../util/logger'
import { ApiTagsSearchCreateRequestBody } from '../../../../services/api-service'
import { prisma } from '../../../../prisma/prisma'

export type ApiTagsSearch = Prisma.PromiseReturnType<typeof findTags>

async function findTags(searchInput: string) {
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
      take: 20,
    })
  } catch (error) {
    throw new Error(`Error while finding tags: ${error}`)
  }
}

export default async function _apiTagsSearch(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { body: requestBody, method } = req
  logAPI('TAGS_SEARCH', method)

  switch (method) {
    case 'POST': {
      // TODO parse needed?
      const { searchInput }: ApiTagsSearchCreateRequestBody = requestBody

      const tagsSearchCreated: ApiTagsSearch = await findTags(searchInput)

      res.status(200).json(tagsSearchCreated)
      break
    }
    default: {
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
