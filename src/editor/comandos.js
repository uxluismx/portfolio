// Menú de comandos al escribir "/" (como en Notion). Inserta la sintaxis MDX que soporta el sitio.
// Las plantillas usan el formato de snippets de CodeMirror: ${nombre} es un campo editable y
// Tab salta al siguiente. ${} al final deja el cursor después de la sintaxis de cierre.

import { snippet } from "@codemirror/autocomplete";
import { EditorState } from "@codemirror/state";
import { EditorView } from "codemirror";

const SECCION_TEXTO = { name: "Texto", rank: 0 };
const SECCION_BLOQUES = { name: "Bloques", rank: 1 };
const SECCION_ESPACIOS = { name: "Espacios", rank: 2 };

// bloque: true → va en su propio párrafo (si hay texto antes en la línea, se separa)
const COMANDOS = [
  {
    nombre: "Encabezado 2",
    atajo: "##",
    icono: "h2",
    claves: "titulo título heading h2 seccion sección",
    plantilla: "## ${Título}",
    bloque: true,
    seccion: SECCION_TEXTO,
  },
  {
    nombre: "Encabezado 3",
    atajo: "###",
    icono: "h3",
    claves: "titulo título subtitulo subtítulo heading h3",
    plantilla: "### ${Subtítulo}",
    bloque: true,
    seccion: SECCION_TEXTO,
  },
  {
    nombre: "Negritas",
    atajo: "**",
    icono: "negritas",
    claves: "bold strong negrita",
    plantilla: "**${texto}**${}",
    seccion: SECCION_TEXTO,
  },
  {
    nombre: "Cursivas",
    atajo: "*",
    icono: "cursivas",
    claves: "italic italica itálica em",
    plantilla: "*${texto}*${}",
    seccion: SECCION_TEXTO,
  },
  {
    nombre: "Enlace",
    atajo: "[ ]( )",
    icono: "enlace",
    claves: "link url vinculo vínculo",
    plantilla: "[${texto}](${https://})${}",
    seccion: SECCION_TEXTO,
  },
  {
    nombre: "Lista",
    atajo: "-",
    icono: "lista",
    claves: "bullet viñetas vinetas ul list",
    plantilla: "- ${elemento}",
    bloque: true,
    seccion: SECCION_BLOQUES,
  },
  {
    nombre: "Lista numerada",
    atajo: "1.",
    icono: "numerada",
    claves: "numbered ordenada ol list",
    plantilla: "1. ${elemento}",
    bloque: true,
    seccion: SECCION_BLOQUES,
  },
  {
    nombre: "Cita",
    atajo: ">",
    icono: "cita",
    claves: "quote blockquote frase",
    plantilla: "> ${texto}",
    bloque: true,
    seccion: SECCION_BLOQUES,
  },
  {
    nombre: "Imagen",
    atajo: "Cloudinary",
    icono: "imagen",
    claves: "image foto picture cloudinary img",
    // Sola en su línea para que el plugin remark reemplace el párrafo completo
    plantilla: "![${descripción}](${publicId})\n\n${}",
    bloque: true,
    seccion: SECCION_BLOQUES,
  },
  {
    nombre: "Separador",
    atajo: "---",
    icono: "separador",
    claves: "divider hr linea línea",
    plantilla: "---\n\n${}",
    bloque: true,
    seccion: SECCION_BLOQUES,
  },
  {
    nombre: "Salto de línea",
    atajo: "<br />",
    icono: "salto",
    claves: "br break enter",
    plantilla: "<br />\n${}",
    seccion: SECCION_ESPACIOS,
  },
  {
    nombre: "Espacio grande",
    atajo: "<br /><br />",
    icono: "espacio",
    claves: "br space separacion separación",
    plantilla: "<br /><br />\n\n${}",
    bloque: true,
    seccion: SECCION_ESPACIOS,
  },
];

/** Minúsculas y sin acentos, para que "titulo" encuentre "Título". */
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function aplicar(comando) {
  const insertar = snippet(comando.plantilla);
  return (view, completion, from, to) => {
    let desde = from;
    if (comando.bloque) {
      const linea = view.state.doc.lineAt(from);
      const antes = view.state.sliceDoc(linea.from, from);
      // Hay texto antes del "/" en la misma línea: el bloque empieza en un párrafo nuevo
      if (antes.trim()) {
        // También se quitan los espacios que quedaron antes del "/"
        const inicio = from - (antes.length - antes.trimEnd().length);
        view.dispatch({ changes: { from: inicio, to, insert: "\n\n" } });
        desde = inicio + 2;
        return insertar(view, completion, desde, desde);
      }
      // Solo espacios antes del "/": se quitan para que el Markdown no lo lea como código
      desde = linea.from;
    }
    insertar(view, completion, desde, to);
  };
}

const opciones = COMANDOS.map((comando) => ({
  label: comando.nombre,
  detail: comando.atajo,
  type: `comando-${comando.icono}`,
  section: comando.seccion,
  apply: aplicar(comando),
  busqueda: normalizar(`${comando.nombre} ${comando.claves}`),
}));

function fuenteComandos(context) {
  // "/" al inicio de la línea o después de un espacio (no en URLs ni en </etiquetas>)
  const encontrado = context.matchBefore(/(?:^|(?<=\s))\/[\p{L}\d]*$/u);
  if (!encontrado) return null;
  // No se abre dentro del frontmatter
  if (enFrontmatter(context.state, context.pos)) return null;

  const consulta = normalizar(encontrado.text.slice(1));
  const coincidencias = opciones.filter((opcion) =>
    consulta.split(/\s+/).every((parte) => opcion.busqueda.includes(parte))
  );
  if (!coincidencias.length) return null;

  return { from: encontrado.from, options: coincidencias, filter: false };
}

function enFrontmatter(state, pos) {
  const doc = state.doc;
  if (doc.line(1).text.trim() !== "---") return false;
  for (let n = 2; n <= doc.lines; n++) {
    const linea = doc.line(n);
    if (linea.text.trim() === "---") return pos <= linea.to;
  }
  return true;
}

// Texto del ícono de cada comando (clase cm-completionIcon-comando-*)
const ICONOS = {
  h2: "H2",
  h3: "H3",
  negritas: "B",
  cursivas: "I",
  enlace: "↗",
  lista: "•",
  numerada: "1.",
  cita: "❝",
  imagen: "▣",
  separador: "—",
  salto: "↵",
  espacio: "⇣",
};

const estiloIconos = Object.fromEntries(
  Object.entries(ICONOS).map(([nombre, texto]) => [
    `.cm-completionIcon-comando-${nombre}::after`,
    { content: `"${texto}"` },
  ])
);

// Aspecto del menú, inspirado en el de Notion
const tema = EditorView.theme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    border: "1px solid #e2e2de",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 12px 32px rgba(15, 15, 15, 0.12), 0 2px 6px rgba(15, 15, 15, 0.06)",
    padding: "6px",
    fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul": {
    minWidth: "280px",
    maxHeight: "22rem",
    fontFamily: "inherit",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > completion-section": {
    display: "block",
    padding: "10px 8px 4px",
    border: "none",
    borderBottom: "none",
    color: "#8a8a85",
    fontSize: "12px",
    fontWeight: "600",
    opacity: "1",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "5px 8px",
    borderRadius: "8px",
    lineHeight: "1.3",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
    background: "#efefec",
    color: "inherit",
  },
  ".cm-completionIcon": {
    flex: "none",
    width: "28px",
    height: "28px",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e2de",
    borderRadius: "6px",
    background: "#ffffff",
    color: "#1d1d1b",
    fontSize: "13px",
    fontWeight: "600",
    opacity: "1",
  },
  ...estiloIconos,
  // Va después de estiloIconos para no perder el content
  ".cm-completionIcon-comando-cursivas::after": {
    content: '"I"',
    fontStyle: "italic",
    fontFamily: "Georgia, serif",
  },
  ".cm-completionLabel": {
    flex: "1",
    fontSize: "14px",
  },
  ".cm-completionDetail": {
    marginLeft: "auto",
    paddingLeft: "16px",
    color: "#8a8a85",
    fontStyle: "normal",
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: "12px",
  },
});

/** Extensión para el editor: el menú de "/" y su aspecto. */
export const comandos = [
  EditorState.languageData.of(() => [{ autocomplete: fuenteComandos }]),
  tema,
];
