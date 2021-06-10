import Head from 'next/head'
import { Page, PageSection } from '../components/Page'
import ErrorPage from 'next/error'
import { Link } from '../components/Link'
import { Box } from '../components/Box'
import { GetStaticProps } from 'next'
import { prisma } from '../prisma/prisma'
import { Views } from '../components/Likes'
import { Comments } from '../components/Comments'
import { PostCategory, Prisma, PrismaClient } from '@prisma/client'

interface PageProps {
  posts: Exclude<Prisma.PromiseReturnType<typeof findPosts>, null>
  postCategories: PostCategory[]
  noOfPostsCreatedLast24Hours: number
}

async function findPosts(prisma: PrismaClient) {
  return await prisma.post.findMany({ take: 20, include: { category: true } })
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const posts = await findPosts(prisma)
  const postCategories = await prisma.postCategory.findMany()

  const now = new Date()
  const nowYesterday = new Date(now.setHours(now.getHours() - 24))
  const noOfPostsCreatedLast24Hours = await prisma.post.count({
    where: { createdAt: { gte: nowYesterday } },
  })

  return {
    props: {
      posts,
      postCategories,
      noOfPostsCreatedLast24Hours,
    },
    revalidate: 2, // seconds
    // revalidate: 60 * 2, // seconds
  }
}

export const Home = ({ posts, postCategories }: PageProps): JSX.Element => {
  // const { posts, isLoading } = usePosts()

  return (
    <Page>
      <Head>
        <title>Condun</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center text-7xl font-extrabold leading-none tracking-tight">
        <span className="uppercase decoration-clone bg-clip-text text-transparent bg-gradient-to-b from-amber-400 to-orange-800">
          Condun
        </span>
      </div>

      <PageSection>
        <p className="text-2xl italic">Find by category</p>
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4 text-center text-lg">
          {postCategories.map((category) => (
            <Box smallPadding key={category.id}>
              <span className="hover:font-bold cursor-pointer">
                {category.title}
              </span>
            </Box>
          ))}
        </div>
      </PageSection>

      {/* <PageSection>
        <button
          className="p-10 bg-green-300"
          onClick={async () => {
            try {
              await createPost({
                title: 'title ' + Math.random(),
                subtitle: 'subtitle ' + Math.random(),
                category: 'books',
              })
            } catch (err) {
              throw new Error(err)
            }
          }}
        >
          New
        </button>
      </PageSection> */}

      {!posts ? (
        <ErrorPage statusCode={404}>Error while fetching posts</ErrorPage>
      ) : (
        <>
          <PageSection>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:gap-12">
              {posts.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          </PageSection>
        </>
      )}
    </Page>
  )
}

export default Home

function PostItem({ post }: { post: PageProps['posts'][number] }): JSX.Element {
  return (
    <Link to={`/post/${post.id}`}>
      <Box smallPadding>
        <div className="w-full h-60 text-center relative">
          <h2 className="tracking-widest text-xs font-medium text-gray-400">
            {post.category.title}
          </h2>
          <h1 className="mt-1 sm:text-2xl text-xl font-medium">{post.title}</h1>
          <p className="mt-3 leading-relaxed">{post.subtitle}</p>
          <div className="text-center mt-2 leading-none flex justify-center absolute bottom-0 w-full py-3 space-x-4">
            <Views>1.2K</Views>
            <Comments>6</Comments>
            <span className="text-gray-400 inline-flex items-center leading-none text-sm">
              {post.updatedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
      </Box>
    </Link>
  )
}
