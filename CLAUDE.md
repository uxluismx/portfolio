# Portafolio de Luis Erick

Portafolio personal (diseñador UX/UI) con una sección de casos de estudio escritos en MDX.
Astro 6 con salida estática, MDX (`@astrojs/mdx`), imágenes en Cloudinary (`astro-cloudinary`),
Vercel Analytics y Speed Insights. El deploy a Vercel es automático al hacer push a `master`.
El contenido y los comentarios del código están en español.

## Seguridad

- **Nunca leer, imprimir ni copiar `.env` ni otros archivos de credenciales.** Ahí están las
  credenciales de Cloudinary y otras API keys locales. Si hace falta saber qué variables existen,
  preguntar al usuario.
- `.env`, `.env.local`, `.env.production` y `.vercel` están en `.gitignore`. No modificar esas reglas.

## Git y deploy

- Cuando el usuario diga **"sube los cambios"**, significa: agrupar los cambios en commits
  organizados por tema (formato `tipo: descripción` en español, por ejemplo `fix:`, `feat:`, `docs:`)
  y hacer push a `origin/master`. El push publica en producción (Vercel).
- **Borradores sin publicar**: no hacer commit de estos archivos hasta que el usuario lo pida.
  Están en `.gitignore` para que `git add -A` no los incluya. Para publicar uno, quitarlo del
  `.gitignore` y de esta lista en el mismo commit.
  - `src/content/proyectos/eleventa-6-app.mdx`
- Mientras no haya ningún MDX publicado, la colección está vacía en producción y no existe ninguna página `/proyectos/[slug]`.

## Comandos

- `npm run dev`: servidor local en http://localhost:4321
- `npm run build`: build estático a `dist/`. Es la forma rápida de validar un cambio.
- No hay tests ni linter. El formato lo da Prettier (`.prettierrc`: 2 espacios, comillas dobles, 100 columnas).

## Mapa del proyecto

- `src/pages/index.astro`: home. Todas sus secciones están escritas a mano.
- `src/pages/proyectos/index.astro`: listado de proyectos. Las tarjetas (`NewProjectCard`) están
  escritas a mano y enlazan a Instagram o Behance, no a las páginas MDX. La tarjeta de eleventa
  que apunta al slug interno está comentada.
- `src/pages/proyectos/[slug].astro`: página de cada caso de estudio MDX (Hero, MockupPlayer y contenido).
- `src/content.config.ts`: schema de la colección `proyectos`.
- `src/content/proyectos/*.mdx`: casos de estudio. `template.mdx` está en `.gitignore` a propósito
  (los borradores también, ver "Git y deploy").
- `src/components/mdx/MDx*.astro`: sustituyen los elementos HTML del MDX para aplicarles las
  clases de `global.css`. Se conectan en el prop `components` de `<Content />` en `[slug].astro`.
- `src/plugins/remark-cloudinary-images.mjs`: convierte `![alt](publicId)` en `<img>` JSX.
- `src/layout/Layout.astro`: layout único. Props: `title`, `isActive` y `navbar` (con `false` se oculta el navbar).
  Incluye `<ClientRouter />`, que activa las view transitions.
- `src/styles/global.css`: fuentes, reset, tokens y clases utilitarias.
- `public/icons/*.svg`: íconos que se usan con `<IconWrapper name="archivo-sin-extension" />`.
- `public/images/projects/`: logos y mockups locales de cada proyecto.

## Flujo de un caso de estudio MDX

1. El frontmatter se valida contra `content.config.ts`. Campos: `title`, `accentTitle`,
   `description`, `logo`, `platform` (`Desktop` o `Mobile`), `mockupFile`, `externalLink?` y `date`.
2. `logo` corresponde a `public/images/projects/{logo}-logo.webp`.
3. `mockupFile` corresponde a `{mockupFile}.webp` en Desktop, o a `{mockupFile}-01/02/03.webp` en
   Mobile (lo maneja `MockupPlayer.astro`).
4. El dominio de `externalLink` define el texto y el ícono del botón (`externalLinkMap` en `[slug].astro`).
5. En el cuerpo, `![alt](publicId)` pasa por el plugin remark, luego por `MDxImg` y luego por
   `MaximizeImage`, que muestra una miniatura y abre un overlay a pantalla completa con `CldImage`.
   - El `publicId` de Cloudinary va sin extensión.
   - Los `src` que empiezan con `http`, `/` o `.` no pasan por el plugin.
   - Las imágenes deben ir solas en su línea. Así el plugin reemplaza el párrafo completo y no queda un `<div>` dentro de un `<p>`.
6. Los bloques de código (```) todavía no tienen el diseño terminado.

## Convenciones de estilo

- Los estilos van en un `<style>` dentro de cada componente, con CSS anidado (`&:hover`, selectores hijos).
- Para el contenido del MDX o de componentes hijos se usa `:global(...)`.
- Tipografía y utilidades de `global.css`:
  - `display-*` (Sora), `accent-*` (IBM Plex Serif) y `body-*` (Geist)
  - `color-primary`, `color-secondary`, etc.
  - `shadow-*`, `stroke-*`, `flex-row`, `flex-column`
- Tokens: `--semantic-*` (colores), `--radii-*`, `--stroke-*` y `--weight-*`. Usar tokens, no valores sueltos.
- El diseño es de una sola columna (`main` con `max-width: 40rem`). Breakpoints: 640px y 440px.
- El modo oscuro está comentado en `global.css`. Por ahora solo hay tema claro.

## Trampas conocidas

- **El CSS anidado no marca error si falta una `}`.** Todo lo que sigue queda anidado sin avisar.
  Al terminar de editar un `<style>`, confirmar que el número de llaves cuadra y revisar el CSS generado en `dist/`.
- **HTML inválido**: un componente que renderiza `<div>` o `<button>` no debe quedar dentro de
  `MDxP` (`<p>`), porque el navegador cierra el párrafo y deja `<p>` vacíos con margen.
- **Scripts**: un `<script define:vars>` se vuelve `is:inline` y se ejecuta una vez por cada instancia.
  Con `ClientRouter`, los scripts procesados (sin `is:inline`) corren solo una vez por sesión, así que
  la inicialización debe ir en el evento `astro:page-load`.
- **Imágenes ocultas**: un `<img>` con `visibility: hidden` sí se descarga, pero con `display: none` y
  `loading="lazy"` no. Por eso `MaximizeImage` oculta el overlay con `display: none`.
- `.npmrc` tiene `legacy-peer-deps=true`. Hay que mantenerlo para que `npm install` funcione.

## Mantenimiento de este archivo

Actualizarlo en el mismo cambio cuando se modifique la estructura, el schema, el flujo MDX o una
convención. Solo debe contener lo que no se deduce rápido leyendo el código.
