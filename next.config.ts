import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Firebase Hosting configuration - only enable export when specifically building for hosting
  output: process.env.BUILD_FOR_HOSTING === 'true' ? 'export' : undefined,
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