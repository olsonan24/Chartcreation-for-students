import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aionis Timeline Formula",
  description: "A private timeline chart creator for phone and web.",
  applicationName: "Aionis Timeline Formula",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Aionis",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/aionis-timeline-formula-logo.jpg",
    shortcut: "/aionis-timeline-formula-logo.jpg",
    apple: "/aionis-timeline-formula-logo.jpg",
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
