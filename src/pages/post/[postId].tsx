import { GetServerSideProps } from 'next'
import { prisma } from '../../prisma/prisma'
import { PostCategory, PrismaClient } from '.prisma/client'
import { PostPageWrapper } from '../../components/pages/post/PostPage'
import { Prisma } from '@prisma/client'

export interface PostPageProps {
  post: Exclude<Prisma.PromiseReturnType<typeof findPost>, null>
  postCategories: PostCategory[]
  tagsSorted: Exclude<Prisma.PromiseReturnType<typeof findTagsForPost>, null>
  tagsSortedForCategory: Exclude<
    Prisma.PromiseReturnType<typeof findTagsForPostByCategory>,
    null
  >
}

async function findTagsForPost(prisma: PrismaClient) {
  return await prisma.postTag.findMany({
    orderBy: { posts: { _count: 'desc' } },
  })
}

async function findTagsForPostByCategory(
  prisma: PrismaClient,
  categoryId: string
) {
  return await prisma.postTag.findMany({
    where: { posts: { some: { postCategoryId: categoryId } } },
    orderBy: { posts: { _count: 'desc' } },
  })
}

async function findPost(prisma: PrismaClient, postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: true,
      tags: true,
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}): Promise<
  { props: PostPageProps } | { props: { '404'?: null; '500'?: null } }
> => {
  if (!params || typeof params.postId !== 'string') {
    res.statusCode = 404
    return { props: { '404': null } }
  } else {
    const post = await findPost(prisma, params.postId)
    if (!post) return { props: { '500': null } }

    const postCategories = await prisma.postCategory.findMany()

    const tagsSorted = await findTagsForPost(prisma)
    const tagsSortedForCategory = await findTagsForPostByCategory(
      prisma,
      post.postCategoryId
    )

    return {
      props: {
        post,
        postCategories,
        tagsSorted,
        tagsSortedForCategory,
      },
    }
  }
}

const PostViewPage = ({
  post,
  postCategories,
  tagsSorted,
  tagsSortedForCategory,
}: PostPageProps): JSX.Element => {
  return (
    <PostPageWrapper
      post={post}
      postCategories={postCategories}
      tagsSorted={tagsSorted}
      tagsSortedForCategory={tagsSortedForCategory}
    />
  )
}

export default PostViewPage
