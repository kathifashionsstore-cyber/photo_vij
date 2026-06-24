import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.webp', 'logo192.png', 'logo512.png'],
      manifest: {
        name: 'Snaplica Photography',
        short_name: 'Snaplica',
        description: 'Snaplica Photography bookings, services, and galleries.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/logo192.png', sizes: '192x192', type: 'image/png' },
          { src: '/logo512.png', sizes: '512x512', type: 'image/png' },
          { src: '/logo512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        navigateFallback: '/',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        globIgnores: [
          'images/**',
          'services/**',
          'awards/**',
          'audio/**',
          'videos/**',
          '**/*.jpg',
          '**/*.jpeg'
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    port: 5173,
    // This makes ALL routes (including /admin) work in Vite dev server
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('node_modules')) return undefined;
          if (normalizedId.includes('node_modules/@fullcalendar/')) return 'vendor-calendar';
          if (normalizedId.includes('node_modules/recharts') || normalizedId.includes('node_modules/d3-')) return 'vendor-charts';
          if (normalizedId.includes('node_modules/jspdf')) return 'vendor-jspdf';
          if (normalizedId.includes('node_modules/html2canvas')) return 'vendor-html2canvas';
          if (normalizedId.includes('node_modules/dompurify')) return 'vendor-dompurify';
          if (normalizedId.includes('node_modules/firebase') || normalizedId.includes('node_modules/@firebase')) return 'vendor-firebase';
          if (normalizedId.includes('node_modules/framer-motion')) return 'vendor-motion';
          if (normalizedId.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (
            normalizedId.includes('node_modules/react/') ||
            normalizedId.includes('node_modules/react-dom/') ||
            normalizedId.includes('node_modules/react-router') ||
            normalizedId.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          return undefined;
        }
      }
    }
  }
});
