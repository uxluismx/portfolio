import type { TransitionDirectionalAnimations } from "astro";

/**
 * Transición de entrada escalonada para las páginas (ClientRouter).
 * El contenido anterior se desvanece; el nuevo entra con opacity 0 → 1 y
 * translateY(16px) → 0 (keyframes en global.css). Igual al avanzar o regresar.
 *
 * @param delay retraso de la entrada en ms (el Hero entra primero, el resto después)
 */
export function fadeUp(delay: number): TransitionDirectionalAnimations {
  const pair = {
    old: { name: "pageFadeOut", duration: 150, easing: "ease-in", fillMode: "both" },
    new: {
      name: "pageFadeUp",
      duration: 400,
      delay: `${delay}ms`,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fillMode: "both",
    },
  };
  return { forwards: pair, backwards: pair };
}

// Secuencia: primero el Hero y 200ms después el resto del contenido
export const HERO_DELAY = 0;
export const CONTENT_DELAY = HERO_DELAY + 200;
