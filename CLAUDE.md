# Portafolio de Luis Erick

Portafolio personal (diseñador UX/UI) con una sección de casos de estudio escritos en MDX.
Astro 6 con salida estática, MDX (`@astrojs/mdx`), imágenes en Cloudinary (`astro-cloudinary`),
Vercel Analytics y Speed Insights. El deploy a Vercel es automático al hacer push a `master`.
El contenido y los comentarios del código están en español.

## Reglas de colaboración (Erick)

- **Al empezar cada hilo**: `git fetch --prune` y `git pull --ff-only` en la rama actual antes de
  revisar o tocar nada. Si hay cambios locales sin commit o ramas abiertas, avisar antes de seguir.
- Erick lleva la batuta. Ante dudas puntuales o decisiones importantes, preguntarle (responde rápido).
- **Funcionalidades y mejoras, aunque sean pequeñas o medianas: proponer siempre una rama nueva**
  (`feat/...`, `fix/...`, `refactor/...`, `docs/...`, `chore/...`) antes de empezar. Nada llega a
  `master` a medias: cada cambio debe estar completo y validado (build + preview de Vercel) antes de producción.
- **Mejoras proactivas**: si algo es claramente mejorable y no rompe nada importante, aplicarlo sin
  pedir permiso (dentro de la rama de trabajo) y mencionarlo en el resumen.
- Comunicación, commits y comentarios del código en español.

## Seguridad

- **Nunca leer, imprimir ni copiar `.env` ni otros archivos de credenciales.** Ahí están las
  credenciales de Cloudinary y otras API keys locales. Si hace falta saber qué variables existen,
  preguntar al usuario.
- `.env`, `.env.local`, `.env.production` y `.vercel` están en `.gitignore`. No modificar esas reglas.

## Git y deploy

- Cuando el usuario diga **"sube los cambios"**, significa: agrupar los cambios en commits
  organizados por tema (formato `tipo: descripción` en español, por ejemplo `fix:`, `feat:`, `docs:`)
  y hacer push a `origin/master`. El push publica en producción (Vercel). Si se está trabajando en
  una rama, "sube los cambios" significa push de esa rama (preview), no de `master`.
- **Ramas de prueba**: para cambios que el usuario quiera validar antes de producción, crear una
  rama desde `master` (`feat/...`, `fix/...`) y hacer push de la rama. Vercel genera un preview.
  La URL se obtiene con `gh api repos/uxluismx/portfolio/deployments` y luego `.../deployments/{id}/statuses`.
- **Al hacer merge de una rama**, completar todo el ciclo sin que el usuario lo pida por partes:
  1. Confirmar que la rama no tiene cambios pendientes y que `npm run build` pasa.
  2. `git fetch --prune`, cambiar a `master` y ejecutar `git pull --ff-only`.
  3. `git merge --ff-only <rama>`. Si no se puede por fast-forward, usar `git merge --no-ff`
     (nunca rebase ni force-push sobre `master`).
  4. Hacer push de `master`, lo que publica en producción.
  5. Borrar la rama local (`git branch -d`) y la remota (`git push origin --delete <rama>`), y
     luego `git fetch --prune`.
  6. Verificar que el deploy de producción en Vercel terminó bien (`gh api .../commits/<sha>/statuses`)
     e informar el resultado.
- **Borradores sin publicar**: no hacer commit de estos archivos hasta que el usuario lo pida.
  Están en `.gitignore` para que `git add -A` no los incluya. Para publicar uno, quitarlo del
  `.gitignore` y de esta lista en el mismo commit.
  - `src/content/proyectos/eleventa-6-app.mdx`
  - Al publicar un borrador su tarjeta aparece sola en `/proyectos/` (y en el home si tiene `starred: true`).
- Mientras ningún proyecto publicado tenga contenido, no existe ninguna página `/proyectos/[slug]` en producción.

## Comandos

- `npm run dev`: servidor local en http://localhost:4321
- `npm run build`: build estático a `dist/`. Es la forma rápida de validar un cambio.
  Localmente también genera las páginas de los borradores ignorados (por ejemplo `/proyectos/eleventa-6-app`);
  en Vercel no existen porque el archivo no está en el repo.
- Node `>=22.12` (`engines` en `package.json`).
- No hay tests ni linter. El formato lo da Prettier (`.prettierrc`: 2 espacios, comillas dobles, 100 columnas).

## Mapa del proyecto

- `src/pages/index.astro`: home. Sus secciones están escritas a mano, salvo los proyectos destacados.
- `src/pages/proyectos/index.astro`: listado de proyectos con `NewProjectCard`.
- `src/utils/proyectos.ts`: `getProyectos()` lee la colección, la ordena por `date` (más reciente primero)
  y calcula `slug`, `tienePagina` y `enlace`. Es la fuente única del listado, del home (`starred: true`),
  de las páginas `/proyectos/[slug]` y del JSON-LD. Ver "Proyectos" más abajo.
- `src/data/perfil.ts`: nombre, cargo, ubicación, redes y CV. Lo usan el Header (redes con `header: true`)
  y el JSON-LD. Las redes son perfiles verificados con el usuario `uxluismx`. Sin email a propósito (spam).
- `NewProjectCard.astro`: recibe el `enlace` ya calculado. Interno sin `target`, externo con `_blank`; sin
  enlace se renderiza como `<div>` sin animación al pasar el mouse (caso "Próximamente", como Retorna).
- `src/pages/proyectos/[slug].astro`: página de cada proyecto con contenido (Hero, MockupPlayer y contenido).
- `src/content.config.ts`: schema de la colección `proyectos`, con un comentario por campo.
- `src/content/proyectos/*.{md,mdx}`: un archivo por proyecto. `template.mdx` está en `.gitignore` a propósito
  (los borradores también, ver "Git y deploy").
- `src/components/mdx/MDx*.astro`: sustituyen los elementos HTML del MDX para aplicarles las
  clases de `global.css`. Se conectan en el prop `components` de `<Content />` en `[slug].astro`.
- `src/plugins/remark-cloudinary-images.mjs`: convierte `![alt](publicId)` en `<img>` JSX. Se registra en
  `mdx({ remarkPlugins })` de `astro.config.mjs` (no en `markdown.remarkPlugins`, que está deprecado).
- `src/layout/Layout.astro`: layout único. Props: `title`, `isActive` (tipo `PaginaActiva` en `src/types.ts`; al crear
  una página nueva, agregarla ahí) y `navbar` (con `false` se oculta el navbar).
  Incluye `<ClientRouter />`, que activa las view transitions.
  - SEO: props opcionales `description`, `image` (ruta en `/public`), `imageAlt`, `largeImage`
    (tarjeta grande en X para imágenes horizontales) y `noindex` (lo usa la 404, que además no lleva canonical).
    Sin props se usan la descripción general y `public/images/og-default.jpg` (foto de perfil 1200×1200).
  - Datos estructurados: prop `schema` con los nodos JSON-LD de la página. El Layout siempre agrega
    `Person` y `WebSite` en un solo `@graph` (excepto con `noindex`). Los nodos se construyen en
    `src/utils/schema.ts` y se enlazan por `@id` (`https://uxluismx.com/#person`):
    home → `ProfilePage`; `/proyectos/` → `CollectionPage` + `BreadcrumbList`; casos MDX → `Article` + `BreadcrumbList`.
    Al cambiar el contenido del perfil, actualizar `actualizado` en `perfil.ts` (es el `dateModified` del ProfilePage).
    El JSON-LD debe coincidir con lo visible en la página (regla de Google).
  - Canonical, `og:url` y `og:image` se arman con `site` de `astro.config.mjs` (`https://uxluismx.com`).
    `www.uxluismx.com` redirige al dominio sin `www`.
- `@astrojs/sitemap` genera `sitemap-index.xml` en el build (excluye la 404); `public/robots.txt` lo referencia.
  Las URLs del sitemap y del canonical terminan en `/`; deben coincidir.
- `src/styles/global.css`: fuentes, reset, tokens y clases utilitarias.
- `public/icons/*.svg`: íconos que se usan con `<IconWrapper name="archivo-sin-extension" />`.
- `public/images/projects/`: logos y mockups locales de cada proyecto.

## Proyectos

1. Un archivo por proyecto en `src/content/proyectos/`. El nombre del archivo es el slug (`lavva.md` → `/proyectos/lavva/`).
2. El frontmatter se valida contra `content.config.ts`. Campos: `title`, `shortText`, `sector?`, `pillText`,
   `pillIcon`, `platform` (`Desktop` o `Mobile`), `mockupFile`, `externalLink?`, `starred?`, `date`,
   `accentTitle?` y `description?`.
3. El destino de la tarjeta sale solo:
   - Con contenido debajo del frontmatter (`.mdx`): se genera `/proyectos/{slug}/` y la tarjeta enlaza ahí.
     `accentTitle` y `description` pasan a ser obligatorios (`getProyectos()` falla si faltan).
   - Solo frontmatter (`.md`) con `externalLink`: la tarjeta abre el link en otra pestaña y no hay página.
   - Solo frontmatter sin `externalLink`: tarjeta "Próximamente" sin enlace.
4. `mockupFile` define el mockup (`{mockupFile}.webp` en Desktop, `{mockupFile}-01/02/03.webp` en Mobile,
   lo maneja `MockupPlayer.astro`) y el logo (`{mockupFile}-logo.webp`), todo en `public/images/projects/`.
   El schema hace fallar el build si falta alguna de esas imágenes.
5. `starred: true` muestra el proyecto en el home. `sector` es el giro que va al JSON-LD (`shortText` puede ser "¡Próximamente!").
6. En una página de proyecto, el dominio de `externalLink` define el texto y el ícono del botón del Hero
   (`externalLinkMap` en `[slug].astro`).
7. En el cuerpo, `![alt](publicId)` pasa por el plugin remark, luego por `MDxImg` y luego por
   `MaximizeImage`, que muestra una miniatura y abre un overlay a pantalla completa con `CldImage`.
   - El `publicId` de Cloudinary va sin extensión.
   - Los `src` que empiezan con `http`, `/` o `.` no pasan por el plugin.
   - Las imágenes deben ir solas en su línea. Así el plugin reemplaza el párrafo completo y no queda un `<div>` dentro de un `<p>`.
8. Los bloques de código (```) todavía no tienen el diseño terminado.

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
- **Transiciones de página**: `ClientRouter` con 5 nombres.
  - `page-card` (`main`) y `page-content` (`article`) están en `Layout.astro`.
  - `page-hero` (`<section>` del Hero) está en `Hero.astro`.
  - Secuencia: primero entra el Hero y 200ms después el resto (fade + 16px hacia arriba). Tiempos
    en `src/utils/pageTransitions.ts`, keyframes en `global.css`.
  - `site-header` (en `Header.astro`) y `site-navbar` (en `Layout.astro`) no se animan.
  - Cada nombre debe aparecer una sola vez por página.
  - No envolver el `<header>` en otro elemento: pierde su `position: sticky`.
- **Imágenes ocultas**: un `<img>` con `visibility: hidden` sí se descarga, pero con `display: none` y
  `loading="lazy"` no. Por eso `MaximizeImage` oculta el overlay con `display: none`.
- **Caché de contenido**: Astro guarda la colección en `node_modules/.astro/data-store.json` y solo vuelve a validar
  un archivo cuando ese archivo cambia. Si el build falla con `UnknownContentCollectionError` después de mover
  un borrador, o si borras una imagen de un proyecto que no cambió, ejecuta `rm -rf node_modules/.astro` y vuelve a compilar.
- `.npmrc` tiene `legacy-peer-deps=true`. Hay que mantenerlo para que `npm install` funcione.
- **El reset fija `font-size: 16px` en `*`**: cada elemento parte de 16px (no hereda el tamaño del
  padre) y se ignora el tamaño de letra que el usuario configure en el navegador. Cada texto necesita su clase tipográfica.

## Pendientes y deuda técnica conocida

Detectados en la revisión del 2026-10-21. Quitar de la lista lo que se resuelva.

- **Imagen para compartir**: `og-default.jpg` es la foto de perfil cuadrada (tarjeta pequeña). Lo ideal
  es una imagen diseñada de 1200×630 px y pasar a `largeImage` por defecto.
- Bloques de código del MDX (`MDxPre`, `MDxCode`) sin diseño final.
- Modo oscuro comentado en `global.css`.
- Dependencias: Astro 7 y `@astrojs/mdx` 8 son versiones mayores pendientes. Deben ir en su propia rama.

## Mantenimiento de este archivo

Actualizarlo en el mismo cambio cuando se modifique la estructura, el schema, el flujo MDX o una
convención. Solo debe contener lo que no se deduce rápido leyendo el código.
