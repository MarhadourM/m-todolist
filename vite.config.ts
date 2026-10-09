import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/m-todolist/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'm-todolist',
        short_name: 'Todo',
        description: 'TodoList synchronisée sur tous tes appareils',
        lang: 'fr',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/m-todolist/',
        scope: '/m-todolist/',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
})
