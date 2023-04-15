import { createServerSideHelpers } from '@trpc/react-query/server'
import type { GetStaticProps } from 'next'
import Head from 'next/head'
import { SearchPage } from '../components/pages/SearchPage'
import { createPrefetchHelpersArgs } from '../server/prefetch-helpers'

const revalidateInSeconds = 1

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createServerSideHelpers(await createPrefetchHelpersArgs())

  await ssg.postCategories.all.prefetch()

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: revalidateInSeconds,
  }
}

export default function _SearchPage(): JSX.Element {
  return (
    <>
      <Head>
        <title>Summora · Search</title>
      </Head>
      <SearchPage />
    </>
  )
}
