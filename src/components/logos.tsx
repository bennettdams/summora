import Image from 'next/image'

function createAssetPath(assetId: string): string {
  return `/assets/${assetId}`
}

export function LogoPayPal(): JSX.Element {
  return (
    <Image
      src={createAssetPath('logo-paypal.svg')}
      className="inline"
      alt="Vercel Logo"
      width={72}
      height={16}
    />
  )
}
