import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import remarkBreaks from 'remark-breaks';

export default defineConfig({
  site: 'https://nidome-no-tensei.pages.dev',
  base: '/',
  integrations: [tailwind({ applyBaseStyles: false })],
  server: { host: false, port: 4321 },
  vite: {
    server: {
      fs: { allow: ['..'] },
      watch: { usePolling: false, ignored: ['**/node_modules/**', '**/.git/**'] },
    },
  },
  markdown: {
    remarkPlugins: [remarkBreaks],
  },
});
