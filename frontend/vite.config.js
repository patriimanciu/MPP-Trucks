import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.svg', '**/*.jpg'],
  optimizeDeps: {
    exclude: ['pg', 'pg-cloudflare'],
    include: ['cookie'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  server: {
    proxy: {
      '/api': 'https://www.truckmanagement.cfd',
    },
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      include: [/cookie/, /node_modules/]
    },
    rollupOptions: {
      external: ['pg', 'pg-cloudflare'],
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          'cookie': ['cookie']
        }
      }
    }
  }
});