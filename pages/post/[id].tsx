import { Post, PrismaClient } from '@prisma/client'
import { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/dist/client/router'
import ErrorPage from 'next/error'

const prisma = new PrismaClient()

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  if (!params || typeof params.id !== 'string') {
    res.statusCode = 404
    return { props: {} }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 5000))

    const post = await prisma.post.findUnique({
      where: { id: params.id },
    })
    return {
      props: {
        initialPost: post,
      },
    }
  }
}

export const PostPage: NextPage<{ initialPost: Post | null }> = ({
  initialPost,
}): JSX.Element => {
  const { isFallback } = useRouter()
  return isFallback ? (
    <p>fallback</p>
  ) : !initialPost ? (
    <ErrorPage statusCode={404} />
  ) : (
    <div className="bg-white">
      <p>{initialPost.id}</p>
      <p>{initialPost.title}</p>
      <p>{initialPost.content}</p>
    </div>
  )
}

export default PostPage
