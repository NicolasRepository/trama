import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// No GitHub Pages o site fica em /<nome-do-repo>/ (definido pelo workflow via BASE_PATH).
// Localmente e no servidor Express/Docker o base continua sendo '/'.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  build: {
    rollupOptions: {
      input: {
        landing: fileURLToPath(new URL('./index.html', import.meta.url)),
        portal: fileURLToPath(new URL('./portal.html', import.meta.url)),
      },
    },
  },
});
