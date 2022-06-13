import Image from 'next/image'

function createAssetPath(assetId: string): string {
  return `/assets/${assetId}`
}

const ASSETS = { paypal: 'logo-paypal', bitcoin: 'logo-bitcoin' } as const

function Logo({ assetId }: { assetId: string }): JSX.Element {
  return (
    <Image
      src={createAssetPath(`${assetId}.svg`)}
      className="inline"
      alt={assetId}
      width={72}
      height={16}
    />
  )
}

export function LogoPayPal(): JSX.Element {
  return <Logo assetId={ASSETS.paypal} />
}

export function LogoBitcoin(): JSX.Element {
  return <Logo assetId={ASSETS.bitcoin} />
}
