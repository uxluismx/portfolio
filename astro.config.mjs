// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import { remarkCloudinaryImages } from './src/plugins/remark-cloudinary-images.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkCloudinaryImages],
  },
});