/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        (process.env.NEXT_PUBLIC_APP_URL ?? '').replace('https://', '').replace('http://', ''),
      ].filter(Boolean),
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

export default nextConfig;
