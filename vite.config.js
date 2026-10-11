import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = '/web-audio-app/';
const THEME = '#09090b'; // zinc-950

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Prompt (not autoUpdate) so a new SW never reloads mid-song — see PwaUpdatePrompt
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'audio-equalizer-device.svg'],
      manifest: {
        id: BASE,
        name: 'Web Audio Player',
        short_name: 'Audio Player',
        description: 'Audio player with waveform scrubbing and real-time visualizations.',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        theme_color: THEME,
        background_color: THEME,
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell + lazy music-metadata chunks. example.mp3 (16 MB) is deliberately NOT precached.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // WaveSurfer's full fetch fills the cache; <audio> Range requests are then served from it
            urlPattern: ({ url }) => url.pathname.endsWith('/example.mp3'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'example-audio',
              cacheableResponse: { statuses: [200] },
              rangeRequests: true,
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
});
