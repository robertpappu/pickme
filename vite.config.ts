import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/signzy': {
        target: 'https://api-preproduction.signzy.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/signzy/, ''),
        secure: true,
        headers: {
          'Origin': 'https://api-preproduction.signzy.app'
        }
      },
    },
  },
});