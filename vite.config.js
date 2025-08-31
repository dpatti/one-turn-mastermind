import { defineConfig } from 'vite';

export default defineConfig({
  base: '/one-turn-mastermind/',
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