// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { remarkCloudinaryImages } from './src/plugins/remark-cloudinary-images.mjs';
import { shikiBloquesCodigo } from './src/plugins/shiki-bloques-codigo.mjs';

// https://astro.build/config
export default defineConfig({
  // Dominio de producción: base para canonical, Open Graph y sitemap
  site: 'https://uxluismx.com',
  // El plugin de Cloudinary genera nodos JSX, así que solo aplica a MDX
  // (`markdown.remarkPlugins` está deprecado desde Astro 6.4)
  // Resaltado de sintaxis: los colores salen de las variables --astro-code-* de global.css
  markdown: {
    shikiConfig: { theme: 'css-variables', transformers: [shikiBloquesCodigo()] },
  },
  integrations: [mdx({ remarkPlugins: [remarkCloudinaryImages] }), sitemap()],
});
