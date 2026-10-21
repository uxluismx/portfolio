// Tarjetas de proyectos (NewProjectCard). Fuente única para el listado, el home y el JSON-LD.
// Las imágenes salen de public/images/projects/ a partir de `mockupFile` (ver MockupPlayer).

export interface Proyecto {
  platform: "Desktop" | "Mobile";
  mockupFile: string;
  businessName: string;
  shortText: string;
  sector?: string; // giro del negocio, para el JSON-LD (shortText puede ser "¡Próximamente!")
  pillText: string;
  pillIcon: string;
  slug: string;
  href?: string; // enlace externo; sin href la tarjeta no enlaza ("Próximamente")
  destacado?: boolean; // también aparece en el home
}

export const proyectos: Proyecto[] = [
  // eleventa 6: pendiente hasta publicar src/content/proyectos/eleventa-6-app.mdx
  // { platform: "Desktop", mockupFile: "app-eleventa", businessName: "eleventa 6",
  //   shortText: "¡Próximamente!", pillText: "Flutter App", pillIcon: "code-square", slug: "eleventa-6-app" },
  {
    platform: "Mobile",
    mockupFile: "app-retorna",
    businessName: "Retorna",
    shortText: "¡Próximamente!",
    pillText: "Flutter App",
    pillIcon: "code-square",
    slug: "retorna",
  },
  {
    platform: "Desktop",
    mockupFile: "landing-lavva",
    businessName: "LAVVA",
    shortText: "Gym & Fitness",
    sector: "Gym & Fitness",
    pillText: "Landing page",
    pillIcon: "pantone-color",
    href: "https://www.instagram.com/p/DVtZ0lOgO_J/?utm_source=portfolio&utm_medium=proyectos",
    slug: "lavva",
    destacado: true,
  },
  {
    platform: "Mobile",
    mockupFile: "app-unibetas",
    businessName: "Unibetas",
    shortText: "E-learning",
    sector: "E-learning",
    pillText: "Web App",
    pillIcon: "internet-earth",
    href: "https://www.instagram.com/p/DTJO7clkmUn/?utm_source=portfolio&utm_medium=proyectos",
    slug: "unibetas",
    destacado: true,
  },
  {
    platform: "Desktop",
    mockupFile: "landing-hemisferio",
    businessName: "Hemisferio",
    shortText: "Agencia",
    sector: "Agencia",
    pillText: "Landing page",
    pillIcon: "pantone-color",
    href: "https://www.behance.net/gallery/222837805/Landing-Page-for-Hemisferiopro?platform=direct&utm_source=portfolio&utm_medium=proyectos",
    slug: "hemisferio",
  },
  {
    platform: "Desktop",
    mockupFile: "landing-naut",
    businessName: "NAUT",
    shortText: "Salud visual",
    sector: "Salud visual",
    pillText: "Landing page",
    pillIcon: "pantone-color",
    href: "https://www.instagram.com/p/DEa6NFpSWVR/?utm_source=portfolio&utm_medium=proyectos",
    slug: "naut",
  },
  {
    platform: "Desktop",
    mockupFile: "landing-mastermind",
    businessName: "Mastermind",
    shortText: "E-learning",
    sector: "E-learning",
    pillText: "Landing page",
    pillIcon: "pantone-color",
    href: "https://www.instagram.com/p/C3uSgaIurYC/?utm_source=portfolio&utm_medium=proyectos",
    slug: "mastermind",
  },
];
