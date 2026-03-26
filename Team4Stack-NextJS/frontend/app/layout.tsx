import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/providers/Providers';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.team4stack.com"),
  title: {
    default: "Team4Stack - MERN Development, Courses, and Digital Solutions",
    template: "%s | Team4Stack",
  },
  description:
    "Team4Stack provides professional web and mobile development, MERN training courses, and practical digital solutions for startups and businesses.",
  applicationName: "Team4Stack",
  keywords: [
    "Team4Stack",
    "Team Four Stack",
    "Team4Stack official",
    "T4S",
    "team four stack",
    "team4stack courses",
    "team4stack services",
    "team4stack projects",
    "MERN stack",
    "web development",
    "mobile app development",
    "MERN courses",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
  ],
  alternates: {
    canonical: "https://www.team4stack.com",
  },
  icons: {
    icon: [
      { url: "/Team4StackLogo.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/Team4StackLogo.svg"],
    apple: ["/Team4StackLogo.svg"],
  },
  openGraph: {
    type: "website",
    url: "https://www.team4stack.com",
    title: "Team4Stack - Professional Development Services",
    description:
      "Build modern products with Team4Stack: MERN projects, training courses, and scalable web/mobile solutions.",
    siteName: "Team4Stack",
    images: [
      {
        url: "/Team4StackLogo.svg",
        width: 512,
        height: 512,
        alt: "Team4Stack Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team4Stack - Professional Development Services",
    description:
      "MERN development, practical courses, and digital solutions by Team4Stack.",
    images: ["/Team4StackLogo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Team4Stack",
    alternateName: [
      "Team Four Stack",
      "T4S",
      "Team4Stack Official",
      "Team4Stack Collaborators",
    ],
    url: "https://www.team4stack.com",
    logo: "https://www.team4stack.com/Team4StackLogo.svg",
    sameAs: [
      "https://www.tiktok.com/@team4stack_offical",
      "https://youtube.com/@team4stack?si=hJ0lb7php5WTtu_K",
      "https://www.linkedin.com/in/muhammad-sami-ullah-418bb1392?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      "https://whatsapp.com/channel/0029VbCMGxCG3R3iZT4d0W2X",
      "https://www.facebook.com/share/179gv7HbJu/",
    ],
    knowsAbout: [
      "MERN Stack Development",
      "Web Development",
      "Mobile App Development",
      "Software Training",
      "React",
      "Node.js",
    ],
  };

  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Team4Stack",
    alternateName: ["Team Four Stack", "T4S"],
    url: "https://www.team4stack.com",
    publisher: {
      "@type": "Organization",
      name: "Team4Stack",
      logo: {
        "@type": "ImageObject",
        url: "https://www.team4stack.com/Team4StackLogo.svg",
      },
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
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
