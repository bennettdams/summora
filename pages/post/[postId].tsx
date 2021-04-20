import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import { Box } from '../../components/Box'
import { Button } from '../../components/Button'
import { LoadingAnimation } from '../../components/LoadingAnimation'
import { Page, PageSection } from '../../components/Page'
import { usePost } from '../../data/post-helper'

// export const getServerSideProps: GetServerSideProps = async ({
//   params,
//   res,
// }) => {
//   if (!params || typeof params.id !== 'string') {
//     res.statusCode = 404
//     return { props: {} }
//   } else {
//     // await new Promise((resolve) => setTimeout(resolve, 5000))

//     const post = await prisma.post.findUnique({
//       where: { id: params.id },
//     })
//     return {
//       props: {
//         initialPost: post,
//       },
//     }
//   }
// }

// export const PostPage: NextPage<{ initialPost: Post | null }> = ({
//   initialPost = null,
// }): JSX.Element => {
export const PostPage = (): JSX.Element => {
  const {
    query: { postId },
  } = useRouter()
  const { post, isLoading, isError } = usePost(
    !postId || typeof postId !== 'string' ? null : postId
  )

  return (
    <Page>
      {isLoading ? (
        <LoadingAnimation />
      ) : isError ? (
        <ErrorPage statusCode={400}>Error while fetching post</ErrorPage>
      ) : post ? (
        <>
          <PageSection hideTopMargin>
            <Box>
              <h1 className="text-2xl">{post.title}</h1>
              <h1 className="text-sm">{post.id}</h1>
              <p>{post.content}</p>
            </Box>
          </PageSection>
          <PageSection>
            <Button>Add step</Button>
          </PageSection>
        </>
      ) : (
        <p>error?</p>
      )}
    </Page>
  )
}

export default PostPage
