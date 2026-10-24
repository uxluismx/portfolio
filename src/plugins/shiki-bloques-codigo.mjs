// Nombres que se muestran en la pastilla del lenguaje; lo que no esté aquí va en mayúsculas
const NOMBRES = {
  ts: "TypeScript",
  typescript: "TypeScript",
  js: "JavaScript",
  javascript: "JavaScript",
  tsx: "TSX",
  jsx: "JSX",
  mdx: "MDX",
  md: "Markdown",
  astro: "Astro",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  yaml: "YAML",
  yml: "YAML",
  swift: "Swift",
  kotlin: "Kotlin",
  python: "Python",
  py: "Python",
};

const SIN_LENGUAJE = new Set(["", "text", "txt", "plaintext", "plain"]);

const el = (tagName, properties = {}, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const texto = (value) => ({ type: "text", value });

const iconoCopiar = el(
  "svg",
  {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ariaHidden: "true",
  },
  [
    el("rect", { x: 5.5, y: 5.5, width: 8, height: 8, rx: 2 }),
    el("path", {
      d: "M10.5 5.5V4a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 4v5A1.5 1.5 0 0 0 4 10.5h1.5",
    }),
  ]
);

// Líneas a resaltar: {3-4,7} → Set {3, 4, 7}
function leerLineas(meta) {
  const bloque = meta.match(/\{([\d,\-\s]+)\}/);
  const lineas = new Set();
  if (!bloque) return lineas;
  for (const parte of bloque[1].split(",")) {
    const [ini, fin = ini] = parte.trim().split("-").map(Number);
    for (let i = ini; i <= fin; i++) lineas.add(i);
  }
  return lineas;
}

/**
 * Transformer de Shiki: envuelve cada bloque ```lang title="archivo.ts" {3-4}``` en
 * `.code-block` con barra superior (archivo, lenguaje y botón de copiar) y marca
 * las líneas resaltadas. Los estilos y el script de copiar viven en MDxPre.astro.
 */
export function shikiBloquesCodigo() {
  return {
    name: "bloques-codigo",
    line(node, linea) {
      if (leerLineas(this.options.meta?.__raw ?? "").has(linea)) this.addClassToHast(node, "hl");
    },
    root(root) {
      const meta = this.options.meta?.__raw ?? "";
      const titulo = meta.match(/title="([^"]+)"/)?.[1];
      const lenguaje = String(this.options.lang ?? "").toLowerCase();
      const nombre = SIN_LENGUAJE.has(lenguaje)
        ? null
        : (NOMBRES[lenguaje] ?? lenguaje.toUpperCase());

      const info = [];
      if (titulo) info.push(el("span", { class: "code-file" }, [texto(titulo)]));
      if (nombre) info.push(el("span", { class: "code-lang" }, [texto(nombre)]));

      const barra = el("div", { class: "code-head" }, [
        el("div", { class: "code-meta" }, info),
        el("button", { class: "code-copy", type: "button", "data-copy": "" }, [
          iconoCopiar,
          el("span", {}, [texto("Copiar")]),
        ]),
      ]);

      root.children = [el("div", { class: "code-block" }, [barra, ...root.children])];
    },
  };
}
