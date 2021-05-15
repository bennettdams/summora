import { GetServerSideProps } from 'next'
import { prisma } from '../../prisma/prisma'
import { PostCategory } from '.prisma/client'
import { PostPageWrapper } from '../../components/pages/PostPage'
import { PostPostAPI } from '../api/posts/[postId]'

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  if (!params || typeof params.postId !== 'string') {
    res.statusCode = 404
    return { props: {} }
  } else {
    const post = await prisma.post.findUnique({
      where: { id: params.postId },
      include: { category: true, segments: { include: { items: true } } },
    })
    const postCategories = await prisma.postCategory.findMany()

    return {
      props: {
        post,
        postCategories,
      },
    }
  }
}

const PostViewPage = ({
  post,
  postCategories,
}: {
  post: PostPostAPI
  postCategories: PostCategory[]
}): JSX.Element => {
  return <PostPageWrapper post={post} postCategories={postCategories} />
}

export default PostViewPage
