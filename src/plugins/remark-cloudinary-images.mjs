import { visit } from "unist-util-visit";

/**
 * Remark plugin que convierte imágenes con Cloudinary public IDs
 * (src sin http, / o .) en elementos JSX <img> con src como string,
 * evitando que Vite intente resolver el src como un módulo.
 */
export function remarkCloudinaryImages() {
    return (tree) => {
        visit(tree, "image", (node, index, parent) => {
            const url = node.url || "";

            // Solo interceptar src que NO sean URLs, rutas absolutas o relativas
            if (url.startsWith("http") || url.startsWith("/") || url.startsWith(".")) {
                return;
            }

            // Reemplazar el nodo image con un elemento JSX <img>
            // para que el src pase como string plano al componente MDxImg
            parent.children[index] = {
                type: "mdxJsxFlowElement",
                name: "img",
                attributes: [
                    { type: "mdxJsxAttribute", name: "src", value: url },
                    { type: "mdxJsxAttribute", name: "alt", value: node.alt || "" },
                ],
                children: [],
            };
        });
    };
}
