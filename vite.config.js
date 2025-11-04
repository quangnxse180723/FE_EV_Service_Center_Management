// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // <-- alias '@' trỏ tới thư mục src
    },
  },
  define: {
    // Fix for sockjs-client: Define global as globalThis
    global: 'globalThis',
  },
  server: {
    // Forward /api calls to the backend to avoid CORS during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        // leave path intact; backend expects /api/... paths
      },
    },
  },
});
