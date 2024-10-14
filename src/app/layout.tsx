import type { Metadata } from "next";
import { AR_One_Sans } from "next/font/google";
import "./_css/globals.css";
import "./_css/clerk.css"
import { ThemeProvider } from "@/components/system/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from '@next/third-parties/google'
import NextTopLoader from 'nextjs-toploader';

const inter = AR_One_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Quaslation - Quality translation of asian web novels.",
    template: "%s | Quaslation",
  },
  description: "Discover the best fan translations of Asian web novels. Immerse yourself in captivating stories from across Asia.",
  icons: {
    icon: "/icon.jpg",
  },
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: {
        colorPrimary: 'hsl(222.2, 47.4%, 11.2%)', // change this value (you can get it from you're css variables, make sure to include 'hsl' and commas)
          },
      }}
    >
      <html lang="en">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || ""} />
        <Analytics />
        <head>
          <meta name="google-site-verification" content="WGuYF9ls3LP9w_YEzcHyJjm6fJW89UuqIbzkFreANR4" />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NextTopLoader />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
