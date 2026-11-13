// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkCloudinaryImages } from './src/plugins/remark-cloudinary-images.mjs';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción: base para canonical, Open Graph y sitemap
  site: 'https://uxluismx.com',
  integrations: [
    // El plugin de Cloudinary genera nodos JSX, así que solo aplica a MDX.
    // Desde Astro 7 el procesador por defecto (Sätteri) no ejecuta plugins remark:
    // hay que usar `unified()` de `@astrojs/markdown-remark` como procesador de MDX.
    mdx({ processor: unified({ remarkPlugins: [remarkCloudinaryImages] }) }),
    sitemap(),
  ],
});
