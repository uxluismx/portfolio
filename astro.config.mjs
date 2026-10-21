// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkCloudinaryImages } from './src/plugins/remark-cloudinary-images.mjs';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción: base para canonical, Open Graph y sitemap
  site: 'https://uxluismx.com',
  integrations: [mdx(), sitemap()],
  markdown: {
    remarkPlugins: [remarkCloudinaryImages],
  },
});
