import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const proyectos = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/proyectos" }),
  schema: z.object({
    // Título del proyecto o entrada de blog
    title: z.string(),
    accentTitle: z.string(),

    // Descripción corta del proyecto
    description: z.string(),

    // Ruta al logotipo del proyecto (relativa a /public)
    logo: z.string(),

    // Imagen de mockup para Desktop o Mobile (relativa a /public)
    platform: z.enum(["Desktop", "Mobile"]),
    mockupFile: z.string(),

    // Link externo del proyecto (Instagram, Behance, etc.)
    externalLink: z.string().url().optional(),

    // Fecha de publicación
    date: z.coerce.date(),
  }),
});

export const collections = { proyectos };