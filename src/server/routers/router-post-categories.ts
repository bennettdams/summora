import type { Prisma } from '@prisma/client'
import { procedure, router } from '../trpc'

const defaultPostCategoriesSelect = {
  id: true,
  name: true,
} satisfies Prisma.PostCategorySelect

export const postCategoriesRouter = router({
  // READ ALL
  all: procedure.query(async ({ ctx }) => {
    return await ctx.prisma.postCategory.findMany({
      select: defaultPostCategoriesSelect,
      orderBy: { name: 'asc' },
    })
  }),
})
