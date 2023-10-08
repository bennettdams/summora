import { createServerSideHelpers } from '@trpc/react-query/server'
import type { GetStaticProps } from 'next'
import Head from 'next/head'
import { ExplorePage } from '../components/pages/ExplorePage'
import { createPrefetchHelpersArgs } from '../server/prefetch-helpers'

const revalidateInSeconds = 1

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createServerSideHelpers(await createPrefetchHelpersArgs())

  await Promise.all([
    ssg.posts.topByLikes.prefetch({
      dateToFilter: 'all',
      tagIdsToFilter: [],
      categoryIdsToFilter: [],
    }),
    ssg.posts.topByViews.prefetch({
      dateToFilter: 'all',
      tagIdsToFilter: [],
      categoryIdsToFilter: [],
    }),
  ])

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: revalidateInSeconds,
  }
}

export default function _ExplorePage(): JSX.Element {
  return (
    <>
      <Head>
        <title>Summora · Explore</title>
      </Head>
      <ExplorePage />
    </>
  )
}
