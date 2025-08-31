import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    hmr: false
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  }
});