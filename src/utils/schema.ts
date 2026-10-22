import { SITE_URL, perfil, redes } from "../data/perfil";
import type { DatosProyecto, Proyecto } from "./proyectos";

/**
 * Datos estructurados (schema.org en JSON-LD).
 * Layout.astro siempre incluye `persona` y `sitio`; cada página agrega sus nodos con la prop `schema`.
 * Los nodos se enlazan por `@id`, así Person se declara una sola vez.
 */

export type SchemaNode = Record<string, unknown>;

const url = (path: string) => new URL(path, SITE_URL).href;

export const PERSON_ID = url("/#person");
export const WEBSITE_ID = url("/#website");

export const persona: SchemaNode = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: perfil.name,
  alternateName: perfil.username,
  jobTitle: perfil.jobTitle,
  description: perfil.description,
  image: url(perfil.image),
  url: url("/"),
  address: {
    "@type": "PostalAddress",
    addressRegion: perfil.region,
    addressCountry: perfil.country,
  },
  knowsAbout: perfil.knowsAbout,
  sameAs: redes.map((red) => red.url),
};

export const sitio: SchemaNode = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: perfil.name,
  url: url("/"),
  inLanguage: "es-MX",
  author: { "@id": PERSON_ID },
};

// Home: página de perfil (https://developers.google.com/search/docs/appearance/structured-data/profile-page)
export function paginaPerfil(path: string): SchemaNode {
  return {
    "@type": "ProfilePage",
    "@id": url(path),
    url: url(path),
    dateCreated: perfil.creado,
    dateModified: perfil.actualizado,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: { "@id": PERSON_ID },
  };
}

// Imagen representativa de un proyecto (Desktop: mockup horizontal; Mobile: primera pantalla)
function imagenProyecto(p: Pick<DatosProyecto, "platform" | "mockupFile">) {
  return url(`/images/projects/${p.mockupFile}${p.platform === "Mobile" ? "-01" : ""}.webp`);
}

// Listado de proyectos
export function paginaProyectos(path: string, lista: Proyecto[]): SchemaNode {
  return {
    "@type": "CollectionPage",
    "@id": url(path),
    url: url(path),
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": PERSON_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: lista.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "CreativeWork",
          name: p.title,
          genre: p.pillText,
          ...(p.sector && { keywords: p.sector }),
          image: imagenProyecto(p),
          ...(p.enlace && { url: url(p.enlace.href) }),
          creator: { "@id": PERSON_ID },
        },
      })),
    },
  };
}

// Caso de estudio MDX
export function articuloProyecto(
  path: string,
  data: {
    title: string;
    description: string;
    date: Date;
    platform: DatosProyecto["platform"];
    mockupFile: string;
  }
): SchemaNode {
  return {
    "@type": "Article",
    "@id": url(path),
    url: url(path),
    headline: data.title,
    description: data.description,
    image: imagenProyecto(data),
    datePublished: data.date.toISOString(),
    inLanguage: "es-MX",
    author: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

// Migas de pan: [["Inicio", "/"], ["Proyectos", "/proyectos/"], ...]
export function migas(items: [nombre: string, path: string][]): SchemaNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: url(path),
    })),
  };
}
