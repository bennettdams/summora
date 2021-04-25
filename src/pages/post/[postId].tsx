import ErrorPage from 'next/error'
import { useRouter } from 'next/router'
import { Box } from '../../components/Box'
import { Button } from '../../components/Button'
import { LoadingAnimation } from '../../components/LoadingAnimation'
import { Page, PageSection } from '../../components/Page'
import { usePost } from '../../data/post-helper'
import { PostSegment } from '../api/posts/[postId]'

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
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-2/3">
                <p className="text-5xl text-white">{post.title}</p>
                <p className="italic mt-2">{post.subtitle}</p>
              </div>
              <div className="w-full md:w-1/3">
                <Box>
                  <div className="divide-y-1">
                    <p className="text-sm">{post.id}</p>
                    <p>
                      Created at: {new Date(post.createdAt).toLocaleString()}
                    </p>
                    <p>
                      Updated at: {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </Box>
              </div>
            </div>
          </PageSection>
          <PageSection>
            <div className="space-y-4">
              {post.segments.map((segment) => (
                <Segment key={segment.id} segment={segment} />
              ))}
            </div>
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

function Segment({ segment }: { segment: PostSegment }) {
  return (
    <Box smallPadding>
      <h2 className="text-teal-500 text-xl">
        {segment.title} <span>{segment.id}</span>
      </h2>

      {segment.items.map((item) => (
        <p key={item.id}>{item.content}</p>
      ))}
    </Box>
  )
}
