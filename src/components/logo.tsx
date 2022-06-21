import Image from 'next/image'

function createAssetPath(assetId: string): string {
  return `/assets/${assetId}`
}

const LOGOS: Record<
  string,
  { assetId: string; width: number; height: number }
> = {
  paypal: { assetId: 'logo-paypal', width: 72, height: 16 },
  bitcoin: { assetId: 'logo-bitcoin', width: 72, height: 72 },
} as const

export function Logo({ logoId }: { logoId: string }): JSX.Element {
  const logo = LOGOS[logoId]
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
