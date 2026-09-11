import { SerwistProvider } from "@serwist/turbopack/react";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "OctoManager";
const APP_DEFAULT_TITLE = "OctoManager";
const APP_TITLE_TEMPLATE = "%s — OctoManager";
const APP_DESCRIPTION = "Manage your GitHub repositories — toggle visibility, update metadata, and delete repos from a clean, fast UI.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE },
  description: APP_DESCRIPTION,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_DEFAULT_TITLE },
  formatDetection: { telephone: false },
  openGraph: { type: "website", siteName: APP_NAME, title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE }, description: APP_DESCRIPTION },
  twitter: { card: "summary", title: { default: APP_DEFAULT_TITLE, template: APP_TITLE_TEMPLATE }, description: APP_DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#18181b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
        <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}>
        <SerwistProvider swUrl="/serwist/sw.js"><Providers>{children}</Providers></SerwistProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}


