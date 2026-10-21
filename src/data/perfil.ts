// Datos públicos de Luis Erick. Fuente única para el Header y los datos estructurados (JSON-LD).
// Sin email a propósito en el schema: evitar spam.

export const SITE_URL = "https://uxluismx.com";

export const perfil = {
  name: "Luis Erick M.",
  username: "uxluismx",
  jobTitle: "Product Designer",
  description:
    "Product Designer con +5 años de experiencia diseñando webs y software para proyectos SaaS, E-learning y Fintech.",
  image: "/images/profile-luis-erick.webp", // 1200×1200
  region: "Jalisco",
  country: "MX",
  // Fechas del ProfilePage (home), ISO 8601 con hora y zona (Google rechaza solo la fecha).
  // Actualizar `actualizado` al cambiar el contenido del perfil.
  creado: "2026-03-24T00:00:00-06:00",
  actualizado: "2026-10-21T00:00:00-06:00",
  knowsAbout: [
    "Diseño de producto",
    "Diseño UX",
    "Diseño UI",
    "UX Research",
    "Diseño web",
    "SaaS",
    "E-learning",
    "Fintech",
  ],
};

// Perfiles verificados con el usuario "uxluismx". `header: true` los muestra en el Header.
export const redes = [
  { name: "Instagram", url: "https://www.instagram.com/uxluismx/", header: true },
  { name: "Linkedin", url: "https://www.linkedin.com/in/uxluismx/", header: true },
  { name: "Behance", url: "https://www.behance.net/uxluismx", header: false },
  { name: "GitHub", url: "https://github.com/uxluismx", header: false },
  { name: "X", url: "https://x.com/uxluismx", header: false },
  { name: "YouTube", url: "https://www.youtube.com/@uxluismx", header: false },
];

export const CV_URL = "https://mega.nz/file/zcJSUB6L#1voGSUdgXyxlbZwZePugbFI6ZADZnfls8AEKFT4TWeY";
