import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aionis Timeline Formula",
    short_name: "Aionis",
    description: "A private timeline chart creator for phone and web.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3f4f6",
    theme_color: "#111827",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/aionis-timeline-formula-logo.jpg",
        sizes: "1065x1225",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
