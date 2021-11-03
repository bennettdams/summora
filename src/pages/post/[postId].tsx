import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '../../prisma/prisma'
import { PostCategory, PrismaClient } from '.prisma/client'
import { PostPage } from '../../components/pages/post/PostPage'
import { Prisma } from '@prisma/client'

export interface PostPageProps {
  post: Prisma.PromiseReturnType<typeof findPost>
  postCategories: PostCategory[]
  tagsSorted: Prisma.PromiseReturnType<typeof findTagsForPost>
  tagsSortedForCategory: Prisma.PromiseReturnType<
    typeof findTagsForPostByCategory
  >
}

async function findTagsForPost(prisma: PrismaClient) {
  return await prisma.postTag.findMany({
    orderBy: { posts: { _count: 'desc' } },
    take: 20,
  })
}

async function findTagsForPostByCategory(
  prisma: PrismaClient,
  categoryId: string
) {
  return await prisma.postTag.findMany({
    where: { posts: { some: { postCategoryId: categoryId } } },
    orderBy: { posts: { _count: 'desc' } },
    take: 20,
  })
}

/**
 * @throws if post is not found
 */
async function findPost(prisma: PrismaClient, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: true,
      tags: true,
      author: true,
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })
  if (!post) throw new Error(`Post ${postId} not found.`)
  return post
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      // { params: { id: '1' } },
      // { params: { id: '2' } }
    ],
    fallback: 'blocking',
  }
}

const revalidateInSeconds = 10 * 60

export const getStaticProps: GetStaticProps<PostPageProps> = async ({
  params,
}) => {
  if (!params || typeof params.postId !== 'string') {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const postId = params.postId
    let post

    try {
      post = await findPost(prisma, postId)
    } catch (error) {
      console.error(`Post ${postId} not found.`)
      return { notFound: true }
    }

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
      revalidate: revalidateInSeconds,
    }
  }
}

export default function _PostPage(props: PostPageProps): JSX.Element {
  return (
    <PostPage
      post={props.post}
      postCategories={props.postCategories}
      tagsSorted={props.tagsSorted}
      tagsSortedForCategory={props.tagsSortedForCategory}
    />
  )
}
