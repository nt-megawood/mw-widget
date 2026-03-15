import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        classic: `${root}index.html`,
        landscape: `${root}index-landscape.html`,
      },
    },
    outDir: 'dist',
  },
  publicDir: 'public',
});
