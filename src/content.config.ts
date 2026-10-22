import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Un archivo por proyecto. El nombre del archivo es el slug (`lavva.md` → /proyectos/lavva/).
// Con contenido debajo del frontmatter se genera su página; sin contenido, la tarjeta usa
// `externalLink` o queda como "Próximamente" (ver src/utils/proyectos.ts).
const proyectos = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/proyectos" }),
  schema: z
    .object({
      // Nombre del proyecto o negocio (tarjeta y título del Hero)
      title: z.string(),

      // Texto junto al nombre en la tarjeta: el giro ("Gym & Fitness") o "¡Próximamente!"
      shortText: z.string(),

      // Giro del negocio para el JSON-LD (shortText puede ser "¡Próximamente!")
      sector: z.string().optional(),

      // Pill de la tarjeta: texto e ícono de public/icons/ (sin .svg)
      pillText: z.string(),
      pillIcon: z.string(),

      // Mockup: {mockupFile}.webp en Desktop o {mockupFile}-01/02/03.webp en Mobile.
      // El logo siempre es {mockupFile}-logo.webp. Todo en public/images/projects/
      platform: z.enum(["Desktop", "Mobile"]),
      mockupFile: z.string(),

      // Link externo (Instagram, Behance, etc.). Sin contenido es el destino de la tarjeta;
      // con contenido es el botón del Hero
      externalLink: z.string().url().optional(),

      // true: el proyecto se muestra como destacado en el inicio (home).
      // false o sin el campo: solo aparece en /proyectos/
      starred: z.boolean().optional(),

      // Fecha del proyecto: ordena el listado (más reciente primero) y es la fecha de publicación
      date: z.coerce.date(),

      // Títulos del Hero. Obligatorios solo si el proyecto tiene contenido (página propia)
      accentTitle: z.string().optional(),
      description: z.string().optional(),
    })
    .superRefine(({ platform, mockupFile }, ctx) => {
      // Falla el build si falta alguna imagen del proyecto
      const sufijos = platform === "Mobile" ? ["-01", "-02", "-03"] : [""];
      for (const archivo of [...sufijos, "-logo"].map((sufijo) => `${mockupFile}${sufijo}.webp`)) {
        if (!existsSync(join(process.cwd(), "public/images/projects", archivo))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["mockupFile"],
            message: `No existe public/images/projects/${archivo}`,
          });
        }
      }
    }),
});

export const collections = { proyectos };
