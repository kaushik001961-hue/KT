import type { Metadata } from "next";
import "./globals.css";

import SiteChrome from "@/components/layout/SiteChrome";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { getAdminSession } from "@/lib/admin-auth";

const siteUrl =
  "https://krupalitradersprivatelimited.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Krupali Traders Private Limited | Import & Export",
    template:
      "%s | Krupali Traders Private Limited",
  },

  description:
    "Krupali Traders Private Limited connects quality products, reliable suppliers and international markets through professional import and export solutions.",

  keywords: [
    "Krupali Traders Private Limited",
    "Krupali Traders",
    "import export company",
    "import export India",
    "import products",
    "export products",
    "international trading",
    "global trade",
    "India export",
    "India import",
    "international suppliers",
    "international buyers",
  ],

  applicationName:
    "Krupali Traders Private Limited",

  authors: [
    {
      name: "Krupali Traders Private Limited",
      url: siteUrl,
    },
  ],

  creator:
    "Krupali Traders Private Limited",

  publisher:
    "Krupali Traders Private Limited",

  alternates: {
    canonical: siteUrl,
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

  openGraph: {
    type: "website",
    locale: "en_IN",

    url: siteUrl,

    siteName:
      "Krupali Traders Private Limited",

    title:
      "Krupali Traders Private Limited | Import & Export",

    description:
      "Krupali Traders Private Limited connects quality products, reliable suppliers and international markets through professional import and export solutions.",

    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt:
          "Krupali Traders Private Limited - Import & Export",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Krupali Traders Private Limited | Import & Export",

    description:
      "Professional import and export solutions connecting quality products, suppliers and international markets.",

    images: ["/og-image.jpg"],
  },

  category: "business",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getAdminSession();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <SiteChrome
            isAdmin={Boolean(admin)}
          >
            {children}
          </SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}