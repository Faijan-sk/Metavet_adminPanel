const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  output: 'standalone', // Standalone mode for SSR & API

  basePath: '/admin', // Optional if you need the admin base path
  assetPrefix: '/admin', // Optional if you serve assets from basePath
  trailingSlash: true,

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

  images: {
    unoptimized: true
  },

  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  }
}
