import { Prisma } from '@prisma/client'
import { t } from '../trpc'

const defaultPostCategoriesSelect =
  Prisma.validator<Prisma.PostCategorySelect>()({
    id: true,
    name: true,
  })

export const postCategoriesRouter = t.router({
  // READ ALL
  all: t.procedure.query(async ({ ctx }) => {
    return await ctx.prisma.postCategory.findMany({
      select: defaultPostCategoriesSelect,
      orderBy: { name: 'asc' },
    })
  }),
})
