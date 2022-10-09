import { PrismaClient } from '.prisma/client'
import { Prisma } from '@prisma/client'
import { createProxySSGHelpers } from '@trpc/react/ssg'
import { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { PostPage } from '../../../components/pages/post/PostPage'
import {
  hydrationHandler as hydrationHandlerPost,
  prefillServer as prefillServerPost,
} from '../../../data/use-post'
import { dbFindPost } from '../../../lib/db'
import { prisma } from '../../../prisma/prisma'
import { createPrefetchHelpersArgs } from '../../../server/prefetch-helpers'
import { ServerPageProps } from '../../../types/PageProps'
import { ApiPost } from '../../api/posts/[postId]'

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
      label: true,
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
      label: true,
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

type Props = PostPageProps & ServerPageProps

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
      const ssg = createProxySSGHelpers(await createPrefetchHelpersArgs())
      await ssg.user.byUserId.prefetch({ userId: post.authorId })
      await ssg.postComments.byPostId.prefetch({ postId })
      // we could prefetch the user data here, but this only impacts the avatar in the post comments
      // const commentAuthorIds = (await postComments).map(
      //   (comm) => comm.author.userId
      // )

      const client = hydrationHandlerPost.createClient()
      prefillServerPost(client, postId, post)

      const tagsSorted = await findTagsForPost(prisma)
      const tagsSortedForCategory = await findTagsForPostByCategory(
        prisma,
        post.postCategoryId
      )

      return {
        props: {
          trpcState: ssg.dehydrate(),
          dehydratedState: hydrationHandlerPost.dehydrate(client),
          postId,
          tagsSorted,
          tagsSortedForCategory,
        },
        revalidate: revalidateInSeconds,
      }
    }
  }
}

const HydratePost = hydrationHandlerPost.Hydrate

export default function _PostPage(props: Props): JSX.Element {
  return (
    <HydratePost dehydratedState={props.dehydratedState}>
      <PostPage
        postId={props.postId}
        tagsSorted={props.tagsSorted}
        tagsSortedForCategory={props.tagsSortedForCategory}
      />
    </HydratePost>
  )
}
