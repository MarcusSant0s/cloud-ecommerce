import { Geist, Geist_Mono, Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

import NavbarContainer from '../components/Headers/NavbarContainer'
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";

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
    { media: "(prefers-color-scheme: light)", color: "#F7F3F1" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const BRAND = "Brenda Nunes";
const TAGLINE = "Semijoias";
const DESCRIPTION =
  "Semijoias com banho de ouro 18k e prata 925, escolhidas peça a peça. " +
  "Elegância não é ser notada — é ser lembrada.";

export const metadata = {
  title: {
    default: `${BRAND} | ${TAGLINE}`,
    template: `%s | ${BRAND}`,
  },
  description: DESCRIPTION,
  keywords: [
    "semijoias",
    "banho de ouro 18k",
    "prata 925",
    "brincos",
    "colares",
    "anéis",
    "pulseiras",
    "joias femininas",
  ],
  authors: [{ name: BRAND }],
  creator: BRAND,
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: `${BRAND} | ${TAGLINE}`,
    description: DESCRIPTION,
    siteName: BRAND,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} | ${TAGLINE}`,
    description: DESCRIPTION,
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
        <NavbarContainer />
        {children}
        </CartProvider>
        </AuthProvider>
        <Footer></Footer>
        <CookieConsent />
        <Toaster richColors />
      </body>
    </html>
  );
}
