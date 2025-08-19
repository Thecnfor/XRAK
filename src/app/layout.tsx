import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { DocumentWidthProvider } from "@/components/providers/DocumentWidthProvider";
import LoadingScreen from "@/components/layout/LoadingScreen";
import "./globals.css";
import Header from "@/components/layout/Header";
import Home from "@/components/layout/Home";

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "XRAK",
    template: "%s | XRAK",
  },
  description: "基于Next.js构建的现代化Web应用",
  keywords: ["Next.js", "React", "TypeScript", "Web应用"],
  authors: [{ name: "XRAK Team" }],
  creator: "XRAK",
  publisher: "XRAK",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "./",
    title: "XRAK",
    description: "基于Next.js构建的现代化Web应用",
    siteName: "XRAK",
  },
  twitter: {
    card: "summary_large_image",
    title: "XRAK",
    description: "基于Next.js构建的现代化Web应用",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hans-CN" className={`${GeistSans.className} antialiased dark:bg-gray-950`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className={`${notoSansSC.variable} ${notoSerifSC.variable} font-sans antialiased`}
      >
        <DocumentWidthProvider>
          <ReduxProvider>
            <LoadingScreen>
              <Header />
              <Home>
                {children}
              </Home>
            </LoadingScreen>
          </ReduxProvider>
        </DocumentWidthProvider>
      </body>
    </html>
  );
}