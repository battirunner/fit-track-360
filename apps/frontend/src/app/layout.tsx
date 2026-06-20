import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FitTrack",
  description: "PWA fitness and nutrition tracker",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FitTrack",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#4fae8a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
