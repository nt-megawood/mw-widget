import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        classic: resolve(__dirname, 'index.html'),
        landscape: resolve(__dirname, 'index-landscape.html'),
      },
    },
    outDir: 'dist',
  },
  publicDir: 'public',
});
