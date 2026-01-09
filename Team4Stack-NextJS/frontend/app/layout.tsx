import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/providers/Providers';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Team4Stack - Professional Development Services",
  description: "Professional web development, mobile app development, and digital solutions by Team4Stack",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {/* SVG Filter for Liquid Glass Button Effect */}
        <svg xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true" focusable="false">
          <defs>
            <filter id="turbulence-displacement" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
