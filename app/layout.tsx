import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://worldbridge.app";

export const metadata: Metadata = {
  title: {
    default: "WorldBridge — Your path beyond borders",
    template: "%s — WorldBridge",
  },
  description:
    "Find relocation programs, calculate cost of living, and navigate your international journey with AI guidance. Education, work and immigration programs across 13 countries.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "WorldBridge",
    title: "WorldBridge — Your path beyond borders",
    description:
      "Relocation programs, education, work and immigration across 13 countries. AI-powered guidance for CIS users.",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorldBridge — Your path beyond borders",
    description: "Find the best education and relocation programs across 13 countries.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={outfit.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
