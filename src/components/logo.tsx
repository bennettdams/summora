import type { DonationProviderId } from '@prisma/client'
import Image from 'next/image'
import { NoContent } from './typography'

function createAssetPath(assetId: string): string {
  return `/assets/${assetId}`
}

type AssetInfo = {
  assetId: string
  fileExtension: string
  width: number
  height: number
}

/**
 * This is kind of a "mapper" between logo IDs and the real assets.
 * Using this together with logo IDs makes sure that the right logo is used.
 * We use this as another prop to access logos, so changing/removing one produces
 * type errors in the code where it is used.
 */
const TOPIC_IDS = ['donationProviderId', 'signin'] as const
type TopicId = (typeof TOPIC_IDS)[number]

const LOGO_IDS = ['GOOGLE_SIGNIN'] as const
type LogoId = (typeof LOGO_IDS)[number] | DonationProviderId

type LogoInfo = { topics: TopicId[]; assetInfo: AssetInfo }

const LOGOS: Record<LogoId, LogoInfo> = {
  PAYPAL: {
    topics: ['donationProviderId'],
    assetInfo: {
      assetId: 'logo-paypal',
      width: 72,
      height: 16,
      fileExtension: 'svg',
    },
  },
  BITCOIN: {
    topics: ['donationProviderId'],
    assetInfo: {
      assetId: 'logo-bitcoin',
      width: 24,
      height: 24,
      fileExtension: 'svg',
    },
  },
  GOOGLE_SIGNIN: {
    topics: ['signin'],
    assetInfo: {
      assetId: 'logo-google-signin',
      width: 191,
      height: 46,
      fileExtension: 'png',
    },
  },
}

type Logos = typeof LOGOS

type TopicChoice = Logos[LogoId]['topics'][number]

/**
 * We create a second version of the logos with looser types (key is a string instead of string literal).
 * That's because the logo ID is not a string literal as well and we want to use it to find the logo.
 */
const logosForAccess: Record<string, LogoInfo> = LOGOS

export function Logo({
  topic,
  logoIdForAccess,
}: {
  topic: TopicChoice
  logoIdForAccess: LogoId
}): JSX.Element {
  const logo = logosForAccess[logoIdForAccess]
  if (!logo) {
    return <NoContent>No logo for topic: {topic}</NoContent>
  } else {
    return (
      <Image
        src={createAssetPath(
          `${logo.assetInfo.assetId}.${logo.assetInfo.fileExtension}`,
        )}
        className="inline"
        alt={logo.assetInfo.assetId}
        width={logo.assetInfo.width}
        height={logo.assetInfo.height}
      />
    )
  }
}
