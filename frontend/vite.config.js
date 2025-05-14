import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
  assetsInclude: ['**/*.svg', '**/*.jpg'],
  optimizeDeps: {
    exclude: ['pg', 'pg-cloudflare']
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
    },
  },
});