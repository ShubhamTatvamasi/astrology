// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

// The site lives at https://shubhamtatvamasi.com/astrology/
export default defineConfig({
  site: 'https://shubhamtatvamasi.com',
  base: '/astrology',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [svelte(), sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      // astronomy-engine is a single self-contained module; keep it in its own chunk.
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('astronomy-engine')) return 'ephemeris';
          },
        },
      },
    },
  },
});
