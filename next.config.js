/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  basePath: '/admin', // URLs ke liye base path
  assetPrefix: '/admin/', // Static assets ke liye
  trailingSlash: true, // Optional, depends on your URLs
  transpilePackages: [
    '@fullcalendar/common',
    '@fullcalendar/core',
    '@fullcalendar/react',
    '@fullcalendar/daygrid',
    '@fullcalendar/list',
    '@fullcalendar/timegrid'
  ],
  experimental: {
    esmExternals: false
  },
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  },
  // Optional: Next.js dev-server ke static assets ke liye
  // Ye ensure karta hai ki /public folder se images aur files serve ho
  images: {
    unoptimized: true
  }
}
