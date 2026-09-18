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
      {
        // Fotos de perfil de quem avalia no Google.
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // A vitrine morava em /products antes de a loja adotar o vocabulário de
  // joalheria. Redirect permanente para não quebrar link já compartilhado.
  async redirects() {
    return [
      { source: "/products", destination: "/pecas", permanent: true },
      { source: "/products/:id", destination: "/pecas/:id", permanent: true },
    ];
  },
}

export default nextConfig;
