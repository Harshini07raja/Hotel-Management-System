import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      // Only short-code links like /s/aB3x, not /src/...
      '^/s/.*': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      '/mock-hotels': {
        target: 'http://localhost:8088',
        changeOrigin: true
      }
    }
  }
});