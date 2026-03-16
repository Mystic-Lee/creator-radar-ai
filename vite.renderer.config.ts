import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import { resolve }      from 'path';

export default defineConfig({
  plugins: [react()],
  root:    resolve(__dirname, 'src/renderer'),
  base:    './',
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  build: {
    outDir:          resolve(__dirname, 'dist/renderer'),
    emptyOutDir:     true,
    rollupOptions: {
      input: resolve(__dirname, 'src/renderer/index.html'),
    },
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port:       5173,
    strictPort: true,
    open:       false,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});
