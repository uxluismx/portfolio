import { getCollection, type CollectionEntry } from "astro:content";

/**
 * Proyectos de src/content/proyectos/. Fuente única del listado, el home (`starred`),
 * las páginas /proyectos/[slug] y el JSON-LD.
 */

export type DatosProyecto = CollectionEntry<"proyectos">["data"];

export interface Proyecto extends DatosProyecto {
  slug: string; // nombre del archivo sin extensión
  tienePagina: boolean; // tiene contenido debajo del frontmatter → /proyectos/{slug}/
  enlace?: { href: string; externo: boolean }; // destino de la tarjeta; sin enlace es "Próximamente"
  entry: CollectionEntry<"proyectos">;
}

export async function getProyectos(): Promise<Proyecto[]> {
  const entries = await getCollection("proyectos");

  return entries
    .map((entry) => {
      const { data, id } = entry;
      const tienePagina = Boolean(entry.body?.trim());

      if (tienePagina && (!data.accentTitle || !data.description)) {
        throw new Error(`El proyecto "${id}" tiene contenido: le falta accentTitle o description`);
      }

      const enlace = tienePagina
        ? { href: `/proyectos/${id}/`, externo: false }
        : data.externalLink
          ? { href: data.externalLink, externo: true }
          : undefined;

      return { ...data, slug: id, tienePagina, enlace, entry };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}
