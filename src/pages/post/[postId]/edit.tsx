import { PostCategory } from '@prisma/client'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import { LoadingAnimation } from '../../../components/LoadingAnimation'
import { usePost } from '../../../data/post-helper'
import { prisma } from '../../../prisma/prisma'
import { PostPageWrapper } from '../../../components/pages/PostPage'

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  if (!params || typeof params.postId !== 'string') {
    res.statusCode = 404
    return { props: {} }
  } else {
    // await new Promise((resolve) => setTimeout(resolve, 2000))

    const postCategories = await prisma.postCategory.findMany()

    return {
      props: {
        postCategories,
      },
    }
  }
}

const PostEditPage = ({
  postCategories,
}: {
  postCategories: PostCategory[]
}): JSX.Element => {
  const {
    query: { postId },
  } = useRouter()

  return (
    <div>
      {!!postId && typeof postId === 'string' ? (
        <Wrapper postId={postId} postCategories={postCategories} />
      ) : (
        <LoadingAnimation />
      )}
    </div>
  )
}

export default PostEditPage

function Wrapper({
  postId,
  postCategories,
}: {
  postId: string
  postCategories: PostCategory[]
}) {
  const { post, isLoading, isError } = usePost(postId)

  return (
    <>
      {isLoading ? (
        <LoadingAnimation />
      ) : isError ? (
        <ErrorPage statusCode={400}>Error while fetching post</ErrorPage>
      ) : post ? (
        <PostPageWrapper post={post} postCategories={postCategories} />
      ) : (
        <p>error?</p>
      )}
    </>
  )
}
