import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/solitaire-for-my-dad/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Solitaire for my dad',
        short_name: 'Spider',
        description: 'The game Spider Solitaire for my dad',
        theme_color: '#1a5c2a',
        background_color: '#1a5c2a',
        display: 'standalone',
        start_url: '/solitaire-for-my-dad/',
        scope: '/solitaire-for-my-dad/',
        icons: [
          { src: 'icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,ico}'],
      },
    }),
  ],
});
