import { GetStaticPaths, GetStaticProps } from 'next'
import { prisma } from '../../../prisma/prisma'
import { PrismaClient } from '.prisma/client'
import { PostPage } from '../../../components/pages/post/PostPage'
import { Prisma } from '@prisma/client'
import type { ParsedUrlQuery } from 'querystring'
import { ServerPageProps } from '../../../types/PageProps'
import { Hydrate } from 'react-query'
import { hydrationHandler, prefillServer } from '../../../data/use-post'
import {
  prefillServer as prefillServerCategories,
  hydrationHandler as hydrationHandlerCategories,
} from '../../../data/use-post-categories'
import { ApiPost } from '../../api/posts/[postId]'
import { dbFindPost, dbFindPostCategories } from '../../../lib/db'

export interface PostPageProps {
  postId: string
  tagsSorted: Prisma.PromiseReturnType<typeof findTagsForPost>
  tagsSortedForCategory: Prisma.PromiseReturnType<
    typeof findTagsForPostByCategory
  >
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

type Props = PostPageProps &
  ServerPageProps & { dehydratedState2: ServerPageProps['dehydratedState'] }

export const getStaticProps: GetStaticProps<Props, Params> = async ({
  params,
}) => {
  if (!params) {
    // FIXME this is not really "not found", but rather a server error
    return { notFound: true }
  } else {
    const postId = params.postId
    const post: ApiPost = await dbFindPost(postId)

    if (!post) {
      return { notFound: true }
    } else {
      const client = hydrationHandler.createClient()
      prefillServer(client, postId, post)

      const clientCategories = hydrationHandlerCategories.createClient()
      const postCategories = await dbFindPostCategories()
      prefillServerCategories(clientCategories, postCategories)

      const tagsSorted = await findTagsForPost(prisma)
      const tagsSortedForCategory = await findTagsForPostByCategory(
        prisma,
        post.postCategoryId
      )

      return {
        props: {
          dehydratedState: hydrationHandler.dehydrate(client),
          dehydratedState2:
            hydrationHandlerCategories.dehydrate(clientCategories),
          postId,
          tagsSorted,
          tagsSortedForCategory,
        },
        revalidate: revalidateInSeconds,
      }
    }
  }
}

export default function _PostPage(props: Props): JSX.Element {
  return (
    <Hydrate state={hydrationHandler.deserialize(props.dehydratedState)}>
      <Hydrate
        state={hydrationHandlerCategories.deserialize(props.dehydratedState2)}
      >
        <PostPage
          postId={props.postId}
          tagsSorted={props.tagsSorted}
          tagsSortedForCategory={props.tagsSortedForCategory}
        />
      </Hydrate>
    </Hydrate>
  )
}
