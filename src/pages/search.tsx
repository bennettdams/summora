import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { GetStaticProps } from 'next'
import { SearchPage } from '../components/pages/SearchPage'
import { createPrefetchHelpersArgs } from '../server/prefetch-helpers'

// once a day
const revalidateInSeconds = 24 * 60 * 60

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createProxySSGHelpers(await createPrefetchHelpersArgs())

  await ssg.postCategories.all.prefetch()

  return {
    props: {
      trpcState: ssg.dehydrate(),
    },
    revalidate: revalidateInSeconds,
  }
}

export default function _SearchPage(): JSX.Element {
  return <SearchPage />
}