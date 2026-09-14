import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies API + Socket.IO traffic to the Express backend so the
// frontend can use relative URLs (works for the sandbox preview host too).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Accept the sandbox preview host and any proxy host
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_API_TARGET || 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          animation: ['framer-motion'],
        },
      },
    },
  },
});
