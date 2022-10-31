import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { GetStaticPaths, GetStaticProps } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { PostPage } from '../../../components/pages/post/PostPage'
import {
  hydrationHandler as hydrationHandlerPost,
  prefillServer as prefillServerPost,
} from '../../../data/use-post'
import { dbFindPost } from '../../../lib/db'
import { createPrefetchHelpersArgs } from '../../../server/prefetch-helpers'
import { ServerPageProps } from '../../../types/PageProps'
import { ApiPost } from '../../api/posts/[postId]'

export interface PostPageProps {
  postId: string
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

      return {
        props: {
          trpcState: ssg.dehydrate(),
          dehydratedState: hydrationHandlerPost.dehydrate(client),
          postId,
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
      <PostPage postId={props.postId} />
    </HydratePost>
  )
}
