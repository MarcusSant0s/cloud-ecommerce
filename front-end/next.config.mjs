/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },      
      {
        protocol: "https",
        hostname: "cloud-commerce-stack.s3.sa-east-1.amazonaws.com",
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig;
