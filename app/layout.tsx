import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PASS 7 Numerology Charts",
  description: "Peter Vaughan's original PASS numerology chart creator for your phone.",
  applicationName: "PASS 7",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PASS 7",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/app.ico",
    shortcut: "/app.ico",
    apple: "/pass-logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#111827",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
