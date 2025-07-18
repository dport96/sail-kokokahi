/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || 3000}`,
  },
};

export default nextConfig;
