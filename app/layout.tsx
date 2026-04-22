import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GeoBiz Scraper — Find Businesses Worldwide",
  description:
    "Search restaurants, hospitals, hotels and more in any city. Extract real business data including address, phone, email, and GPS coordinates from OpenStreetMap — free, no login required.",
  keywords: "business search, osm, openstreetmap, geo data, scraper, restaurant finder",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
