/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // NEXTAUTH_URL is auto-detected:
    // - On Vercel: uses VERCEL_URL (no manual config needed)
    // - Local dev: uses localhost:PORT
    // - Other platforms: set NEXTAUTH_URL environment variable
    NEXTAUTH_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXTAUTH_URL || `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || 3000}`),
  },
};

export default nextConfig;
