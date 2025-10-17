/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Use NEXT_PUBLIC_APP_URL only in production builds. For local dev, keep NEXTAUTH_URL/hostname:port so
    // NextAuth endpoints remain on localhost and don't redirect to an external URL (which breaks sign-in).
    NEXTAUTH_URL: (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_URL)
      ? process.env.NEXT_PUBLIC_APP_URL
      : (process.env.NEXTAUTH_URL || `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || 3000}`),
  },
};

export default nextConfig;
