import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Post, Prisma, PrismaClient } from '@prisma/client'
import { useState } from 'react'
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
  const [posts] = useState<Post[]>(initialPosts)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-lime-50">
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
                title: 'title 2',
                content: 'content',
              })
              console.log(result)
            } catch (err) {
              console.log(err)
            }
          }}
        >
          New
        </button>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
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
