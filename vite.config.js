import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// На GitHub Pages сайт відкривається за адресою /museum_sun/,
// локально (npm run dev) — з кореня. npm run preview імітує Pages.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'serve' && !isPreview ? '/' : '/museum_sun/',
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' }
    }
  }
}));
