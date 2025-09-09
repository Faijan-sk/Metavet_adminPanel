/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  reactStrictMode: false,

  // GCP deployment ke liye
  // output: 'standalone',

  // Base path configuration (choose one approach)
  basePath: process.env.NODE_ENV === 'production' ? '/admin' : '',

  // Asset prefix - same as basePath ya empty
  assetPrefix: process.env.NODE_ENV === 'production' ? '/admin' : '',

  trailingSlash: true,

  // Transpile packages
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

  // Images configuration
  images: {
    unoptimized: true
    // Agar external images use kar rahe ho to domains add karo
    // domains: ['your-api-domain.com']
  },

  // Webpack configuration
  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }
    return config
  },

  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },

  // Headers for API routes (optional)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }
        ]
      }
    ]
  }
}
