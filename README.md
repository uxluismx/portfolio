# Portafolio de Luis Erick

Portafolio personal de diseño de producto (UX/UI) con casos de estudio en MDX.

- **Stack**: Astro 6 (salida estática), MDX, Cloudinary para imágenes, Vercel Analytics y Speed Insights.
- **Hosting**: Vercel. Cada push a `master` publica en producción; cada rama genera un preview.

## Desarrollo

Requiere Node 22.12 o superior.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # build estático en dist/
npm run preview  # sirve el build localmente
```

Las credenciales de Cloudinary van en un `.env` local (no se versiona).

## Estructura

```
src/
  pages/            index, proyectos/index, proyectos/[slug] (casos MDX) y 404
  layout/           Layout.astro (header, navbar y transiciones entre páginas)
  components/       componentes de UI; mdx/ sustituye los elementos HTML del contenido MDX
  content/proyectos casos de estudio en MDX (schema en src/content.config.ts)
  plugins/          plugin remark para imágenes de Cloudinary
  styles/global.css fuentes, tokens y clases utilitarias
public/
  icons/            íconos SVG para <IconWrapper name="..." />
  images/projects/  logos y mockups de cada proyecto
```

## Flujo de trabajo

1. Crear una rama desde `master` (`feat/...`, `fix/...`, `docs/...`).
2. Validar con `npm run build` y con el preview de Vercel.
3. Hacer merge a `master` cuando el cambio esté completo.

Las convenciones detalladas, el flujo de un caso de estudio MDX y las trampas conocidas están en
[`CLAUDE.md`](./CLAUDE.md).
