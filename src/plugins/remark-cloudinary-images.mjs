import { visit, SKIP } from "unist-util-visit";

// Solo interceptar src que NO sean URLs, rutas absolutas o relativas
function isCloudinaryImage(node) {
    if (node?.type !== "image") return false;
    const url = node.url || "";
    return !(url.startsWith("http") || url.startsWith("/") || url.startsWith("."));
}

function toJsxImg(node, type) {
    return {
        type,
        name: "img",
        attributes: [
            { type: "mdxJsxAttribute", name: "src", value: node.url },
            { type: "mdxJsxAttribute", name: "alt", value: node.alt || "" },
        ],
        children: [],
    };
}

/**
 * Remark plugin que convierte imágenes con Cloudinary public IDs
 * (src sin http, / o .) en elementos JSX <img> con src como string,
 * evitando que Vite intente resolver el src como un módulo.
 */
export function remarkCloudinaryImages() {
    return (tree) => {
        // Si la imagen es lo único en el párrafo, reemplazar el párrafo completo
        // para no renderizar el <div> de MaximizeImage dentro de un <p>
        visit(tree, "paragraph", (node, index, parent) => {
            const children = node.children.filter(
                (child) => !(child.type === "text" && !child.value.trim())
            );
            if (children.length !== 1 || !isCloudinaryImage(children[0])) return;

            parent.children[index] = toJsxImg(children[0], "mdxJsxFlowElement");
            return [SKIP, index];
        });

        // Imágenes mezcladas con texto dentro de un párrafo
        visit(tree, "image", (node, index, parent) => {
            if (!isCloudinaryImage(node)) return;
            parent.children[index] = toJsxImg(node, "mdxJsxTextElement");
        });
    };
}
