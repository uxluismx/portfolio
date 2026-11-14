// Editor local de proyectos: solo existe con `npm run dev`.
// `configureServer` no se ejecuta en `astro build`, así que nada de esto llega a producción.
//
// Rutas:
//   GET  /__editor/                → página del editor (src/editor/index.html)
//   GET  /__editor/api/files       → lista de proyectos editables
//   GET  /__editor/api/file?slug=x → contenido y fecha de modificación del archivo
//   PUT  /__editor/api/file?slug=x → guarda el contenido (409 si cambió por fuera)

import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const RAIZ = "/__editor";
const SLUG_VALIDO = /^[a-z0-9][a-z0-9-]*$/;

export function editorLocal() {
  let dirProyectos = "";
  let dirEditor = "";

  /** Ruta del archivo del proyecto (.mdx o .md), o null si no existe o el slug no es válido. */
  async function rutaProyecto(slug) {
    if (!slug || !SLUG_VALIDO.test(slug)) return null;
    for (const ext of [".mdx", ".md"]) {
      const ruta = path.join(dirProyectos, slug + ext);
      try {
        await stat(ruta);
        return ruta;
      } catch {}
    }
    return null;
  }

  function enviarJson(res, status, datos) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(datos));
  }

  function leerCuerpo(req) {
    return new Promise((resolve, reject) => {
      let cuerpo = "";
      req.setEncoding("utf8");
      req.on("data", (parte) => (cuerpo += parte));
      req.on("end", () => resolve(cuerpo));
      req.on("error", reject);
    });
  }

  return {
    name: "editor-local",
    apply: "serve",

    // Pre-empaquetar CodeMirror al arrancar evita que Vite lo descubra al abrir el editor
    // y recargue la página a mitad de la carga.
    config() {
      return {
        optimizeDeps: {
          include: [
            "codemirror",
            "@codemirror/autocomplete",
            "@codemirror/lang-markdown",
            "@codemirror/lang-yaml",
            "@codemirror/state",
          ],
        },
      };
    },

    configResolved(config) {
      dirProyectos = path.join(config.root, "src/content/proyectos");
      dirEditor = path.join(config.root, "src/editor");
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        if (url.pathname !== RAIZ && !url.pathname.startsWith(RAIZ + "/")) return next();

        try {
          // Página del editor
          if (url.pathname === RAIZ || url.pathname === RAIZ + "/") {
            // Sin transformIndexHtml a propósito: así la página no carga el cliente de HMR y no
            // se recarga sola cuando se guarda el archivo (solo se recarga el preview).
            const html = await readFile(path.join(dirEditor, "index.html"), "utf8");
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.end(html);
          }

          // Las peticiones de la API deben traer este header. Una página de otro sitio no puede
          // mandarlo sin un preflight de CORS que este servidor no acepta, así que no puede
          // escribir archivos aunque conozca la URL.
          if (req.headers["x-editor-local"] !== "1") {
            return enviarJson(res, 403, { error: "Falta el header X-Editor-Local" });
          }

          if (url.pathname === RAIZ + "/api/files" && req.method === "GET") {
            const archivos = (await readdir(dirProyectos))
              .filter((f) => /\.mdx?$/.test(f))
              .map((f) => f.replace(/\.mdx?$/, ""))
              .filter((slug) => SLUG_VALIDO.test(slug) && slug !== "template")
              .sort();
            return enviarJson(res, 200, { archivos });
          }

          if (url.pathname === RAIZ + "/api/file") {
            const ruta = await rutaProyecto(url.searchParams.get("slug"));
            if (!ruta) return enviarJson(res, 404, { error: "No existe ese proyecto" });

            if (req.method === "GET") {
              const [contenido, info] = await Promise.all([readFile(ruta, "utf8"), stat(ruta)]);
              return enviarJson(res, 200, {
                contenido,
                mtime: info.mtimeMs,
                archivo: path.basename(ruta),
              });
            }

            if (req.method === "PUT") {
              const { contenido, mtime } = JSON.parse(await leerCuerpo(req));
              if (typeof contenido !== "string") {
                return enviarJson(res, 400, { error: "Falta el contenido" });
              }
              // Si el archivo cambió desde que se cargó (por ejemplo, en VS Code), no se pisa
              const actual = await stat(ruta);
              if (typeof mtime === "number" && Math.abs(actual.mtimeMs - mtime) > 1) {
                return enviarJson(res, 409, { error: "El archivo cambió fuera del editor" });
              }
              await writeFile(ruta, contenido, "utf8");
              const nuevo = await stat(ruta);
              return enviarJson(res, 200, { mtime: nuevo.mtimeMs });
            }
          }

          return enviarJson(res, 404, { error: "Ruta no encontrada" });
        } catch (error) {
          return enviarJson(res, 500, { error: String(error?.message ?? error) });
        }
      });
    },
  };
}
