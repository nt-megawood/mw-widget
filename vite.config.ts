import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/mw-widget/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        classic: `${root}index.html`,
        landscape: `${root}index-landscape.html`,
        example: `${root}example.html`,
      },
    },
    outDir: 'dist',
  },
  publicDir: 'public',
});
