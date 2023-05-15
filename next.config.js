const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});

/** @type {import("next").NextConfig} */
module.exports = withBundleAnalyzer({
  output: 'export',
  trailingSlash: true,
  reactStrictMode: true,
  swcMinify: false,
  images: {
    unoptimized: true,
    domains: [
      "tokens.1inch.io",
      "ethereum-optimism.github.io",
      "assets.coingecko.com"
    ]
  }
});
