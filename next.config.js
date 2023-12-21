/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'summora-prod.s3.amazonaws.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'condun-bucket-dev.s3.amazonaws.com',
        port: '',
      },
    ],
  },
}

module.exports = nextConfig

/*
 * Use this config instead for the script 'build:analyze'.
 * This will create HTML files that show your bundles.
 * Follow the CLI output for the specific location of the result.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })
// module.exports = withBundleAnalyzer(nextConfig)
// OR
// module.exports = (phase, defaultConfig) => {
//   return withBundleAnalyzer(defaultConfig)
// }
