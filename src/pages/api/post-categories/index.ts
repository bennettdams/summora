import { NextApiRequest, NextApiResponse } from 'next'
import { dbFindPostCategories, DbFindPostCategories } from '../../../lib/db'
import { logAPI } from '../../../util/logger'

export type ApiPostCategories = DbFindPostCategories

export default async function _apiPostCategories(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req

  logAPI('POST_CATEGORIES', method)

  switch (method) {
    case 'GET': {
      const postCategories: ApiPostCategories = await dbFindPostCategories()

      res.status(200).json(postCategories)
      break
    }
    default: {
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
    }
  }
}
