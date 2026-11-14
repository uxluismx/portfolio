// Editor local: CodeMirror a la izquierda, la página del proyecto a la derecha.
// Guarda solo en el archivo .mdx tras una pausa al escribir; Astro detecta el cambio y
// recarga el preview. El servidor está en vite-plugin-editor.mjs.

import { EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { yamlFrontmatter } from "@codemirror/lang-yaml";
import { Annotation } from "@codemirror/state";

const API = "/__editor/api";
const ESPERA_GUARDADO = 700; // ms sin escribir antes de guardar
const CLAVE_PROYECTO = "editor-local:proyecto";
const CLAVE_ANCHO = "editor-local:ancho";

const $ = (id) => document.getElementById(id);
const ui = {
  proyecto: $("proyecto"),
  archivo: $("archivo"),
  estado: $("estado"),
  guardar: $("guardar"),
  abrir: $("abrir"),
  conflicto: $("conflicto"),
  recargar: $("recargar"),
  sobrescribir: $("sobrescribir"),
  paneles: $("paneles"),
  divisor: $("divisor"),
  editor: $("editor"),
  preview: $("preview"),
};

const estado = {
  slug: "",
  mtime: null, // fecha de modificación del archivo cuando se cargó o guardó por última vez
  guardado: "", // último contenido escrito en disco
  temporizador: 0,
  guardando: null, // promesa del guardado en curso
  conflicto: false,
  scrollPreview: 0,
};

// ---------- Utilidades ----------

function leerLocal(clave) {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribirLocal(clave, valor) {
  try {
    localStorage.setItem(clave, valor);
  } catch {}
}

async function api(ruta, opciones = {}) {
  const res = await fetch(API + ruta, {
    ...opciones,
    headers: { "X-Editor-Local": "1", "Content-Type": "application/json", ...opciones.headers },
  });
  const datos = await res.json().catch(() => ({}));
  return { status: res.status, datos };
}

function mostrarEstado(texto, tipo = "") {
  ui.estado.textContent = texto;
  ui.estado.dataset.tipo = tipo;
}

function hora() {
  return new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ---------- Editor ----------

// Marca las transacciones que reemplazan el documento al cargar, para no guardarlas de vuelta
const cargaDesdeDisco = Annotation.define();

const vista = new EditorView({
  parent: ui.editor,
  extensions: [
    basicSetup,
    // El frontmatter (entre ---) se resalta como YAML y el resto como Markdown
    yamlFrontmatter({ content: markdown() }),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !update.transactions.some((t) => t.annotation(cargaDesdeDisco))) {
        programarGuardado();
      }
    }),
  ],
});

function contenidoActual() {
  return vista.state.doc.toString();
}

function hayCambios() {
  return contenidoActual() !== estado.guardado;
}

function reemplazarDocumento(texto) {
  vista.dispatch({
    changes: { from: 0, to: vista.state.doc.length, insert: texto },
    annotations: cargaDesdeDisco.of(true),
  });
}

// ---------- Guardado ----------

function programarGuardado() {
  if (estado.conflicto) return;
  mostrarEstado("Sin guardar", "pendiente");
  clearTimeout(estado.temporizador);
  estado.temporizador = setTimeout(guardar, ESPERA_GUARDADO);
}

async function guardar({ forzar = false } = {}) {
  clearTimeout(estado.temporizador);
  if (estado.guardando) await estado.guardando;
  if (!estado.slug || (!forzar && !hayCambios())) return;
  if (estado.conflicto && !forzar) return;

  const contenido = contenidoActual();
  mostrarEstado("Guardando…", "pendiente");

  estado.guardando = (async () => {
    const { status, datos } = await api(`/file?slug=${encodeURIComponent(estado.slug)}`, {
      method: "PUT",
      body: JSON.stringify({ contenido, mtime: forzar ? null : estado.mtime }),
    });

    if (status === 200) {
      estado.mtime = datos.mtime;
      estado.guardado = contenido;
      estado.conflicto = false;
      ui.conflicto.hidden = true;
      // Si se siguió escribiendo mientras se guardaba, queda pendiente otro guardado
      if (hayCambios()) programarGuardado();
      else mostrarEstado(`Guardado · ${hora()}`, "ok");
    } else if (status === 409) {
      estado.conflicto = true;
      ui.conflicto.hidden = false;
      mostrarEstado("Conflicto: no se guardó", "error");
    } else {
      mostrarEstado(`Error al guardar: ${datos.error ?? status}`, "error");
    }
  })();

  try {
    await estado.guardando;
  } finally {
    estado.guardando = null;
  }
}

// ---------- Carga de proyectos ----------

async function cargarProyecto(slug) {
  if (estado.slug && hayCambios()) await guardar();

  mostrarEstado("Cargando…");
  const { status, datos } = await api(`/file?slug=${encodeURIComponent(slug)}`);
  if (status !== 200) {
    mostrarEstado(`No se pudo abrir: ${datos.error ?? status}`, "error");
    return;
  }

  estado.slug = slug;
  estado.mtime = datos.mtime;
  estado.guardado = datos.contenido;
  estado.conflicto = false;
  estado.scrollPreview = 0;
  ui.conflicto.hidden = true;
  reemplazarDocumento(datos.contenido);

  ui.proyecto.value = slug;
  ui.archivo.textContent = `src/content/proyectos/${datos.archivo}`;
  const url = `/proyectos/${slug}/`;
  ui.abrir.href = url;
  ui.preview.src = url;
  document.title = `${slug} · Editor local`;
  escribirLocal(CLAVE_PROYECTO, slug);

  const params = new URLSearchParams(location.search);
  params.set("slug", slug);
  history.replaceState(null, "", `?${params}`);

  mostrarEstado("Sin cambios");
}

async function iniciar() {
  const { status, datos } = await api("/files");
  if (status !== 200 || !datos.archivos?.length) {
    mostrarEstado("No hay proyectos en src/content/proyectos", "error");
    return;
  }

  for (const slug of datos.archivos) {
    ui.proyecto.append(new Option(slug, slug));
  }

  const pedido = new URLSearchParams(location.search).get("slug") ?? leerLocal(CLAVE_PROYECTO);
  await cargarProyecto(datos.archivos.includes(pedido) ? pedido : datos.archivos[0]);
  vista.focus();
}

// ---------- Cambios hechos fuera del editor (por ejemplo, en VS Code) ----------

const INTERVALO_REVISION = 2000;

async function revisarCambiosExternos() {
  if (!estado.slug || estado.guardando || estado.conflicto || document.hidden) return;
  const { status, datos } = await api(`/file?slug=${encodeURIComponent(estado.slug)}`);
  if (status !== 200 || Math.abs(datos.mtime - estado.mtime) <= 1) return;
  if (datos.contenido === contenidoActual()) {
    estado.mtime = datos.mtime;
    estado.guardado = datos.contenido;
    return;
  }

  if (hayCambios()) {
    // Hay texto sin guardar aquí y el archivo también cambió: que decida la persona
    estado.conflicto = true;
    ui.conflicto.hidden = false;
    clearTimeout(estado.temporizador);
    mostrarEstado("Conflicto: el archivo cambió", "error");
    return;
  }

  // Sin cambios locales: se toma la versión del disco conservando el cursor
  const cursor = Math.min(vista.state.selection.main.head, datos.contenido.length);
  estado.mtime = datos.mtime;
  estado.guardado = datos.contenido;
  vista.dispatch({
    changes: { from: 0, to: vista.state.doc.length, insert: datos.contenido },
    selection: { anchor: cursor },
    annotations: cargaDesdeDisco.of(true),
  });
  mostrarEstado(`Actualizado desde el disco · ${hora()}`, "ok");
}

setInterval(revisarCambiosExternos, INTERVALO_REVISION);

// ---------- Preview: conservar el scroll entre recargas ----------

ui.preview.addEventListener("load", () => {
  let ventana;
  try {
    ventana = ui.preview.contentWindow;
    ventana.scrollY; // lanza error si es una página fuera del sitio
  } catch {
    return;
  }

  // Mientras la página se acomoda (animación de entrada, imágenes que cargan) su altura cambia
  // y el navegador mueve el scroll. Esos movimientos no se guardan, y la posición se vuelve a
  // aplicar hasta que termina. instant: el sitio usa scroll-behavior: smooth.
  const destino = estado.scrollPreview;
  let acomodando = true;
  const aplicar = () => acomodando && ventana.scrollTo({ top: destino, behavior: "instant" });
  aplicar();
  for (const espera of [100, 300, 600]) setTimeout(aplicar, espera);
  setTimeout(() => (acomodando = false), 700);

  // La posición se guarda justo antes de que la página se descargue (Astro recarga el preview
  // al guardar). Si es otra página (se cambió de proyecto), no se guarda.
  const rutaCargada = ventana.location.pathname;
  ventana.addEventListener("pagehide", () => {
    if (rutaCargada !== `/proyectos/${estado.slug}/`) return;
    estado.scrollPreview = acomodando ? destino : ventana.scrollY;
  });
  // Si la persona hace scroll mientras tanto, gana su scroll
  for (const tipo of ["wheel", "touchstart", "keydown"]) {
    ventana.addEventListener(tipo, () => (acomodando = false), { passive: true, once: true });
  }
});

// ---------- Eventos de la interfaz ----------

ui.proyecto.addEventListener("change", () => cargarProyecto(ui.proyecto.value));
ui.guardar.addEventListener("click", () => guardar());

ui.recargar.addEventListener("click", () => {
  estado.conflicto = false;
  estado.guardado = "";
  const slug = estado.slug;
  estado.slug = "";
  cargarProyecto(slug);
});

ui.sobrescribir.addEventListener("click", () => guardar({ forzar: true }));

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    guardar();
  }
});

window.addEventListener("beforeunload", (e) => {
  if (hayCambios()) e.preventDefault();
});

// ---------- Divisor entre paneles ----------

function fijarAncho(porcentaje) {
  const valor = Math.min(80, Math.max(20, porcentaje));
  ui.paneles.style.setProperty("--ancho-editor", `${valor}%`);
  ui.divisor.setAttribute("aria-valuenow", String(Math.round(valor)));
  escribirLocal(CLAVE_ANCHO, String(valor));
}

const anchoGuardado = Number(leerLocal(CLAVE_ANCHO));
if (anchoGuardado) fijarAncho(anchoGuardado);

ui.divisor.addEventListener("pointerdown", (e) => {
  ui.divisor.setPointerCapture(e.pointerId);
  ui.divisor.classList.add("arrastrando");
  ui.paneles.classList.add("arrastrando");
});

ui.divisor.addEventListener("pointermove", (e) => {
  if (!ui.divisor.hasPointerCapture(e.pointerId)) return;
  const caja = ui.paneles.getBoundingClientRect();
  fijarAncho(((e.clientX - caja.left) / caja.width) * 100);
});

ui.divisor.addEventListener("pointerup", (e) => {
  ui.divisor.releasePointerCapture(e.pointerId);
  ui.divisor.classList.remove("arrastrando");
  ui.paneles.classList.remove("arrastrando");
});

ui.divisor.addEventListener("keydown", (e) => {
  const actual = Number(ui.divisor.getAttribute("aria-valuenow")) || 50;
  if (e.key === "ArrowLeft") fijarAncho(actual - 5);
  if (e.key === "ArrowRight") fijarAncho(actual + 5);
});

iniciar();
