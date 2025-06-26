import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Firebase Hosting configuration
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Remove experimental features that might cause issues
  // experimental: {
  //   typedRoutes: true,
  // },
}

export default nextConfig