import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from '@/components/providers/Providers';

const SITE_URL = "https://www.team4stack.com";
const BRAND_NAME = "Team4Stack";
const LOGO_URL = `${SITE_URL}/android-chrome-512x512.png`;
const DASHBOARD_IMAGE_URL =
  "https://raw.githubusercontent.com/Sami3234/Images/main/team4stack/Team4stack_Dashboard.png";
const COURSE_IMAGE_URL =
  "https://raw.githubusercontent.com/Sami3234/Images/main/team4stack/Mern_Stack_Course.png";
const SOCIAL_LINKS = [
  "https://www.facebook.com/share/1GEz7ZJ7TX/",
  "https://vm.tiktok.com/ZS98yuwskv17F-fglJr/",
  "https://www.linkedin.com/in/muhammad-sami-ullah-418bb1392?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  "https://github.com/team4stack",
  "https://youtube.com/@team4stack?si=hJ0lb7php5WTtu_K",
  "https://whatsapp.com/channel/0029VbCMGxCG3R3iZT4d0W2X",
];

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Team4Stack - MERN Development, Courses, and Digital Solutions",
    template: "%s | Team4Stack",
  },
  description:
    "Team4Stack provides professional web and mobile development, MERN training courses, practical digital solutions, and portfolio-ready dashboards for startups and businesses.",
  applicationName: BRAND_NAME,
  authors: [{ name: BRAND_NAME, url: SITE_URL }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  category: "technology",
  keywords: [
    "Team4Stack",
    "Team Four Stack",
    "Team4Stack official",
    "T4S",
    "team four stack",
    "team4stack courses",
    "team4stack services",
    "team4stack projects",
    "team4stack dashboard",
    "team4stack portfolio",
    "t4s courses",
    "t4s services",
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
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: "/Team4StackLogo.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/Team4StackLogo.svg"],
    apple: ["/Team4StackLogo.svg"],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Team4Stack - Professional Development Services",
    description:
      "Build modern products with Team4Stack: MERN projects, training courses, scalable web/mobile solutions, and professional dashboards.",
    siteName: BRAND_NAME,
    images: [
      {
        url: DASHBOARD_IMAGE_URL,
        alt: "Team4Stack dashboard preview",
      },
      {
        url: COURSE_IMAGE_URL,
        alt: "Team4Stack MERN Stack course preview",
      },
      {
        url: LOGO_URL,
        width: 512,
        height: 512,
        alt: "Team4Stack logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Team4Stack - Professional Development Services",
    description:
      "MERN development, practical courses, digital solutions, and dashboard-ready products by Team4Stack.",
    images: [DASHBOARD_IMAGE_URL],
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
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: [
      "Team Four Stack",
      "T4S",
      "Team4Stack Official",
      "Team4Stack Developers",
    ],
    url: SITE_URL,
    slogan: "MERN development, digital products, and practical training by Team4Stack",
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: LOGO_URL,
      contentUrl: LOGO_URL,
      caption: "Team4Stack logo",
      width: 512,
      height: 512,
    },
    image: [
      LOGO_URL,
      DASHBOARD_IMAGE_URL,
      COURSE_IMAGE_URL,
    ],
    sameAs: SOCIAL_LINKS,
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
    "@id": `${SITE_URL}/#website`,
    name: BRAND_NAME,
    alternateName: ["Team Four Stack", "T4S"],
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: BRAND_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };

  const showcaseImagesStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#team4stack-logo-image`,
      name: "Team4Stack logo",
      contentUrl: LOGO_URL,
      url: LOGO_URL,
      representativeOfPage: true,
    },
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#team4stack-dashboard-image`,
      name: "Team4Stack dashboard preview",
      contentUrl: DASHBOARD_IMAGE_URL,
      url: DASHBOARD_IMAGE_URL,
      caption: "Dashboard preview for Team4Stack products and admin experience",
    },
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#team4stack-course-image`,
      name: "Team4Stack MERN Stack course preview",
      contentUrl: COURSE_IMAGE_URL,
      url: COURSE_IMAGE_URL,
      caption: "MERN Stack course preview by Team4Stack",
    },
  ];

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(showcaseImagesStructuredData) }}
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
