import { GetServerSideProps } from 'next'
import { prisma } from '../../prisma/prisma'
import { PostCategory, PrismaClient } from '.prisma/client'
import { PostPageWrapper } from '../../components/pages/post/PostPage'
import { PostPostAPI } from '../api/posts/[postId]'
import { Prisma } from '@prisma/client'

export type PostPostPage = Exclude<
  Prisma.PromiseReturnType<typeof findPost>,
  null
>

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
}) => {
  if (!params || typeof params.postId !== 'string') {
    res.statusCode = 404
    return { props: {} }
  } else {
    const post = await findPost(prisma, params.postId)
    const postCategories = await prisma.postCategory.findMany()

    return {
      props: {
        post,
        postCategories,
      },
    }
  }
}

const PostViewPage = ({
  post,
  postCategories,
}: {
  post: PostPostAPI
  postCategories: PostCategory[]
}): JSX.Element => {
  return <PostPageWrapper postInitial={post} postCategories={postCategories} />
}

export default PostViewPage
