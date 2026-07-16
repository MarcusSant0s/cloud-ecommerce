/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // Serve AVIF when the browser supports it (~20–30% smaller than WebP), else WebP.
    formats: ["image/avif", "image/webp"],
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
