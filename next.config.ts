// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Or your existing config
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Allow any path on this hostname
      },
      // Add other domains if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      // },
    ],
  },
  // ... any other configurations you have
};

module.exports = nextConfig;
