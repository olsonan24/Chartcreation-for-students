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
        "aionis-app-icon.png",
        "aionis-logo-transparent.png",
        "aionis-report-seal.png",
        "app-background-desktop.png",
        "app-background-mobile.png",
        "dashboard-hero-desktop.png",
        "dashboard-hero-mobile.png",
        "compare-background-desktop.png",
        "compare-background-mobile.png",
        "report-header-desktop.png",
        "report-header-mobile.png",
        "report-paper-texture.png",
      ],
      manifest: false,
      workbox: {
        navigateFallback: "/index.html",
        globPatterns: ["**/*.{html,js,css,svg,png,jpg,webmanifest}"],
        globIgnores: ["aionis-cosmic-body.png", "aionis-rhythm.png", "aionis-timeline-formula-logo.jpg"],
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
