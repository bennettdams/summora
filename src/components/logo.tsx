import Image from 'next/image'

function createAssetPath(assetId: string): string {
  return `/assets/${assetId}`
}

/**
 * Logo IDs are not type-safe, as they may come from a string from the database.
 * Therefore we create a wrapper object to access logos, so removing one produces
 * type errors in the code where it is used.
 */
// type LogoTopic = 'donationProviderId' | 'otherVariant'
type LogoTopic = 'donationProviderId'

const LOGOS: Record<
  LogoTopic,
  Record<string, { assetId: string; width: number; height: number }>
> = {
  donationProviderId: {
    paypal: { assetId: 'logo-paypal', width: 72, height: 16 },
    bitcoin: { assetId: 'logo-bitcoin', width: 24, height: 24 },
  },
} as const

export function Logo({
  topic,
  logoId,
}: {
  topic: LogoTopic
  logoId: string
}): JSX.Element {
  const logo = LOGOS[topic][logoId]
  return (
    <Image
      src={createAssetPath(`${logo.assetId}.svg`)}
      className="inline"
      alt={logo.assetId}
      width={logo.width}
      height={logo.height}
    />
  )
}
