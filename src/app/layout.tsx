import type { Metadata } from "next";
import { AR_One_Sans } from "next/font/google";
import "./_css/globals.css";
import "./_css/clerk.css"
import { ThemeProvider } from "@/components/system/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = AR_One_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quaslation",
  description: "Quality translation of japanese web novels.",
  icons: {
    icon: "/logo/logo100x100.jpg",
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
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
