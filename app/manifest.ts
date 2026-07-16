import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PASS 7 Numerology Charts",
    short_name: "PASS 7",
    description: "Peter Vaughan's original PASS numerology chart creator.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f6",
    theme_color: "#111827",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/app.ico",
        sizes: "any",
        type: "image/x-icon",
        purpose: "any maskable",
      },
    ],
  };
}
