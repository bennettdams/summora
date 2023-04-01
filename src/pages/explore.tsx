import { createProxySSGHelpers } from '@trpc/react-query/ssg'
import { GetStaticProps } from 'next'
import { ExplorePage } from '../components/pages/ExplorePage'
import { createPrefetchHelpersArgs } from '../server/prefetch-helpers'

const revalidateInSeconds = 5 * 60

export const getStaticProps: GetStaticProps = async () => {
  const ssg = createProxySSGHelpers(await createPrefetchHelpersArgs())

  await Promise.all([
    ssg.posts.topByLikes.prefetch({
      dateFromPast: 'week',
      tagIdsToFilter: [],
      categoryIdsToFilter: [],
    }),
    ssg.posts.topByViews.prefetch({
      dateFromPast: 'week',
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
  return <ExplorePage />
}
