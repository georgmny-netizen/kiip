import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: '../basic-sources-png',
  server: { port: 5176, open: true }
});
