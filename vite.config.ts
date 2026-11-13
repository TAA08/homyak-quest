import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Имя репозитория для GitHub Pages: https://USER.github.io/homyak-quest/
  base: '/homyak-quest/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Хроноквест — для Гули',
        short_name: 'Хроноквест',
        description: 'OPERATION: BIRTHDAY · 24 ноября',
        theme_color: '#1a2238',
        background_color: '#121826',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ru',
        start_url: '/homyak-quest/',
        scope: '/homyak-quest/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
