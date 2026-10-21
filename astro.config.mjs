// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkCloudinaryImages } from './src/plugins/remark-cloudinary-images.mjs';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción: base para canonical, Open Graph y sitemap
  site: 'https://uxluismx.com',
  // El plugin de Cloudinary genera nodos JSX, así que solo aplica a MDX
  // (`markdown.remarkPlugins` está deprecado desde Astro 6.4)
  integrations: [mdx({ remarkPlugins: [remarkCloudinaryImages] }), sitemap()],
});
