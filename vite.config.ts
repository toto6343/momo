import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      routes: path.resolve(__dirname, './src/routes'),
      utils: path.resolve(__dirname, './src/utils'),
      fbase: path.resolve(__dirname, './src/fbase'),
      types: path.resolve(__dirname, './src/types'),
    },
  },
  server: {
    port: 3000,
  },
});
