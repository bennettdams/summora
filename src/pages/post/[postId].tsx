import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '../../prisma/prisma'
import { PostCategory, PrismaClient } from '.prisma/client'
import { PostPage } from '../../components/pages/post/PostPage'
import { Prisma } from '@prisma/client'
import type { ParsedUrlQuery } from 'querystring'

export interface PostPageProps {
  // exclude null, because the page will return "notFound" if post is null
  post: Exclude<Prisma.PromiseReturnType<typeof findPost>, null>
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

async function findPost(prisma: PrismaClient, postId: string) {
  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      category: true,
      tags: true,
      author: { select: { username: true, hasAvatar: true } },
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    // TODO most popular posts
    paths: [
      // { params: { id: '1' } },
      // { params: { id: '2' } }
    ],
    fallback: 'blocking',
  }
}

interface Params extends ParsedUrlQuery {
  postId: string
}

const revalidateInSeconds = 10 * 60

export const getStaticProps: GetStaticProps<PostPageProps, Params> = async ({
  params,
}) => {
  if (!params) {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const postId = params.postId
    const post = await findPost(prisma, postId)

    if (!post) {
      return { notFound: true }
    } else {
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
