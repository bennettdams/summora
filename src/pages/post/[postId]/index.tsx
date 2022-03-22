import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '../../../prisma/prisma'
import { PostCategory, PrismaClient } from '.prisma/client'
import { PostPage } from '../../../components/pages/post/PostPage'
import { Prisma } from '@prisma/client'
import type { ParsedUrlQuery } from 'querystring'
import { ServerPageProps } from '../../../types/PageProps'
import { Hydrate } from 'react-query'
import { hydrationHandler, prefillServer } from '../../../data/use-post'
import { isServer } from '../../../util/server/server-utils'
import { apiIncrementPostViews } from '../../../services/api-service'
import { ApiPost } from '../../api/posts/[postId]'

export interface PostPageProps {
  postId: string
  postCategories: PostCategory[]
  tagsSorted: Prisma.PromiseReturnType<typeof findTagsForPost>
  tagsSortedForCategory: Prisma.PromiseReturnType<
    typeof findTagsForPostByCategory
  >
  isPostEditMode: boolean
}

async function findTagsForPost(prisma: PrismaClient) {
  return await prisma.postTag.findMany({
    select: {
      id: true,
      title: true,
      description: true,
    },
    orderBy: { posts: { _count: 'desc' } },
    take: 20,
  })
}

async function findTagsForPostByCategory(
  prisma: PrismaClient,
  categoryId: string
) {
  return await prisma.postTag.findMany({
    select: {
      id: true,
      title: true,
      description: true,
    },
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
      tags: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      author: { select: { username: true, imageId: true } },
      segments: {
        orderBy: { createdAt: 'asc' },
        include: { items: { orderBy: { createdAt: 'asc' } } },
      },
      comments: {
        include: {
          author: { select: { username: true, imageId: true } },
          upvotedBy: { select: { userId: true } },
          downvotedBy: { select: { userId: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
      likedBy: { select: { userId: true } },
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

const revalidateInSeconds = 5 * 60

export const getStaticProps: GetStaticProps<
  PostPageProps & ServerPageProps,
  Params
> = async ({ params }) => {
  if (!params) {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const postId = params.postId
    const post: ApiPost = await findPost(prisma, postId)

    if (!post) {
      return { notFound: true }
    } else {
      const client = hydrationHandler.createClient()
      prefillServer(client, postId, post)

      const postCategories = await prisma.postCategory.findMany()

      const tagsSorted = await findTagsForPost(prisma)
      const tagsSortedForCategory = await findTagsForPostByCategory(
        prisma,
        post.postCategoryId
      )

      return {
        props: {
          dehydratedState: hydrationHandler.dehydrate(client),
          postId,
          postCategories,
          tagsSorted,
          tagsSortedForCategory,
          isPostEditMode: true,
        },
        revalidate: revalidateInSeconds,
      }
    }
  }
}

export default function _PostPage(
  props: PostPageProps & ServerPageProps
): JSX.Element {
  if (isServer()) apiIncrementPostViews(props.postId)

  return (
    <Hydrate state={hydrationHandler.deserialize(props.dehydratedState)}>
      <PostPage
        postId={props.postId}
        postCategories={props.postCategories}
        tagsSorted={props.tagsSorted}
        tagsSortedForCategory={props.tagsSortedForCategory}
        isPostEditMode={props.isPostEditMode}
      />
    </Hydrate>
  )
}
