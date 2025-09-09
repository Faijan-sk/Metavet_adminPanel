/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: false,
  output: 'export',

  basePath: '/admin',
  assetPrefix: '/admin',
  trailingSlash: true,

  // Problem वाले pages को skip करें
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    return {
      '/': { page: '/' }
      // जो pages काम कर रहे हैं वो add करें
      // '/apps/invoice/add' को exclude करें
    }
  },

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
