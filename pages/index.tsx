import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Head from 'next/head'
import { Post, Prisma, PrismaClient } from '@prisma/client'
import { useState } from 'react'
import useRouterRefresh from '../hooks/use-router-refresh'
import { useRouter } from 'next/router'

const prisma = new PrismaClient()

export const getServerSideProps: GetServerSideProps = async () => {
  const posts = await prisma.post.findMany()
  return {
    props: {
      initialPosts: posts,
    },
  }
}

async function savePost(post: Prisma.PostCreateInput) {
  const response = await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  })

  if (!response.ok) {
    throw new Error(response.statusText)
  }

  return await response.json()
}

export const Home = ({
  initialPosts,
}: {
  initialPosts: Post[]
}): JSX.Element => {
  const refresh = useRouterRefresh()
  const router = useRouter()
  const refreshData = () => router.replace(router.asPath)
  const [posts] = useState<Post[]>(initialPosts)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-fuchsia-100 via-teal-100 to-blue-300">
      <Head>
        <title>Condu</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="h-12 w-full top-0 fixed bg-lime-500">Condu</header>

      <main className="flex-1 mt-20 flex flex-col">
        <h1 className="bg-red-200">Welcome to Condu!</h1>
        <button
          onClick={async () => {
            try {
              const result = await savePost({
                title: 'title ' + Math.random(),
                content: 'content',
              })
              refresh()
              refreshData()
              console.log(result)
            } catch (err) {
              console.log(err)
            }
          }}
        >
          New
        </button>
        <div>
          {posts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="bg-white">
                <p>{post.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="w-full h-24 border-t flex items-center justify-center">
        <p>Condun</p>
      </footer>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}

export default Home
