import { Geist, Geist_Mono, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

import Navbar from '../components/Headers/Navbar'
import Footer from "@/components/Footer";

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/lib/use-cart";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata = {
  title: {
    default: "Loja | Produtos de qualidade com os melhores preços",
    template: "%s | Loja",
  },
  description: "Encontre os melhores produtos com entrega rápida e preços imbatíveis. Eletrônicos, acessórios, roupas e muito mais.",
  keywords: ["loja online", "compras", "eletrônicos", "acessórios", "promoções"],
  authors: [{ name: "Loja" }],
  creator: "Loja",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Loja | Produtos de qualidade com os melhores preços",
    description: "Encontre os melhores produtos com entrega rápida e preços imbatíveis.",
    siteName: "Loja",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loja | Produtos de qualidade",
    description: "Encontre os melhores produtos com entrega rápida e preços imbatíveis.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${jost.variable} antialiased`}
      >
        <AuthProvider>
        <CartProvider>
        <Navbar> </Navbar> 
        {children}
        </CartProvider>
        </AuthProvider>
        <Footer></Footer>
        <Toaster richColors />
      </body>
    </html>
  );
}
