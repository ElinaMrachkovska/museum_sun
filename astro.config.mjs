import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// Статичний сайт для GitHub Pages: https://elinamrachkovska.github.io/museum_sun/
// Бекенд (Node.js) — окремо, у папці server/.
export default defineConfig({
  site: 'https://elinamrachkovska.github.io',
  base: '/museum_sun',
  trailingSlash: 'ignore',
  integrations: [react()],
  vite: {
    css: { preprocessorOptions: { scss: { api: 'modern-compiler' } } }
  }
});
