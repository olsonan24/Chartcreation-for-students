import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      includeAssets: [
        "aionis-icon.svg",
        "aionis-timeline-formula-logo.jpg",
        "aionis-cosmic-body.png",
        "aionis-rhythm.png",
      ],
      manifest: false,
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{html,js,css,svg,png,jpg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: { host: true, port: 4173 },
  preview: { host: true, port: 4173 },
  build: { outDir: "dist" },
});
