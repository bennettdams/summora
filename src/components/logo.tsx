import Image from 'next/image'

function createAssetPath(assetId: string): string {
  return `/assets/${assetId}`
}

type AssetInfo = {
  assetId: string
  width: number
  height: number
}

/**
 * Logo IDs are not type-safe, as they may come from a string from the database.
 * Therefore we create another prop to access logos, so changing/removing one produces
 * type errors in the code where it is used.
 */
const TOPIC_IDS = ['donationProviderId', 'topic2'] as const
type TopicId = typeof TOPIC_IDS[number]
const LOGO_IDS = ['paypal', 'bitcoin'] as const
type LogoId = typeof LOGO_IDS[number]

type Logoinfo = { topics: TopicId[]; assetInfo: AssetInfo }

const LOGOS: Record<LogoId, Logoinfo> = {
  paypal: {
    topics: ['donationProviderId'],
    assetInfo: { assetId: 'logo-paypal', width: 72, height: 16 },
  },
  bitcoin: {
    topics: ['topic2'],
    assetInfo: { assetId: 'logo-bitcoin', width: 24, height: 24 },
  },
}

type Logos = typeof LOGOS

type TopicChoice = Logos[LogoId]['topics'][number]

/**
 * We create a second version of the logos with looser types (key is a string instead of string literal).
 * That's because the logo ID is not a string literal as well and we want to use it to find the logo.
 */
const logosForAccess: Record<string, Logoinfo> = LOGOS

export function Logo({
  topic,
  logoIdForAccess,
}: {
  topic: TopicChoice
  logoIdForAccess: string
}): JSX.Element {
  const logo = logosForAccess[logoIdForAccess]
  if (!logo) {
    return <span>No logo for topic: {topic}</span>
  } else {
    return (
      <Image
        src={createAssetPath(`${logo.assetInfo.assetId}.svg`)}
        className="inline"
        alt={logo.assetInfo.assetId}
        width={logo.assetInfo.width}
        height={logo.assetInfo.height}
      />
    )
  }
}
