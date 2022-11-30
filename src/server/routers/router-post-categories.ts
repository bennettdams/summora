import { Prisma } from '@prisma/client'
import { procedure, router } from '../trpc'

const defaultPostCategoriesSelect =
  Prisma.validator<Prisma.PostCategorySelect>()({
    id: true,
    name: true,
  })

export const postCategoriesRouter = router({
  // READ ALL
  all: procedure.query(async ({ ctx }) => {
    return await ctx.prisma.postCategory.findMany({
      select: defaultPostCategoriesSelect,
      orderBy: { name: 'asc' },
    })
  }),
})
