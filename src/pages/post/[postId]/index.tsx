import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import type { ParsedUrlQuery } from 'querystring'
import { PostPage } from '../../../components/pages/post/PostPage'
import { createPrefetchHelpersArgs } from '../../../server/prefetch-helpers'
import { ServerPageProps } from '../../../types/PageProps'

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

    const ssg = createProxySSGHelpers(await createPrefetchHelpersArgs())
    const post = await ssg.posts.byPostId.fetch({ postId: params.postId })

    if (!post) {
      return { notFound: true }
    } else {
      await Promise.allSettled([
        ssg.user.byUserId.prefetch({ userId: post.authorId }),
        ssg.postComments.byPostId.prefetch({ postId }),
      ])
      // we could prefetch the comment user data here, but as they're at the bottom of the page, we're not doing it for performance reasons
      // const commentAuthorIds = (await postComments).map(
      //   (comment) => comment.author.userId
      // )

      return {
        props: {
          trpcState: ssg.dehydrate(),
          postId,
        },
        revalidate: revalidateInSeconds,
      }
    }
  }
}

export default function _PostPage(props: Props): JSX.Element {
  return (
    <>
      <Head>
        <title>Summora · Post</title>
      </Head>
      <PostPage postId={props.postId} />
    </>
  )
}
