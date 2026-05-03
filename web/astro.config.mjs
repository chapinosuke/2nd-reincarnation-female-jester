import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import remarkBreaks from 'remark-breaks';

export default defineConfig({
  integrations: [tailwind({ applyBaseStyles: false })],
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
  markdown: {
    remarkPlugins: [remarkBreaks],
    shikiConfig: {
      theme: 'github-dark-dimmed',
    },
  },
});
