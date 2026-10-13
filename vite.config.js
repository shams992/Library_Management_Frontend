import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Hosts allowed to reach the dev server (sandbox preview + local dev).
    allowedHosts: ['.e2b.app', '.arena.ai', 'localhost', '127.0.0.1'],
    // Same-origin API calls: the dev server proxies to the Express API, so the
    // browser never needs to reach the backend host directly.
    proxy: {
      '/api': { target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000', changeOrigin: true },
      '/uploads': { target: process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          data: ['@tanstack/react-query', 'axios'],
          forms: ['react-hook-form', 'zod', '@hookform/resolvers'],
        },
      },
    },
  },
});
