import type { Value } from "platejs";

/**
 * 将 Plate Value 转换为 HTML 字符串
 * @param nodes - Plate Value (Slate 节点数组)
 * @returns HTML 字符串
 */
export function serializeToHtml(nodes: Value): string {
  return nodes.map((node) => serializeNode(node)).join("");
}

function serializeNode(node: any): string {
  if ("text" in node) {
    let text = escapeHtml(node.text);

    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline) {
      text = `<u>${text}</u>`;
    }

    return text;
  }

  const children = node.children?.map((child: any) => serializeNode(child)).join("") || "";

  switch (node.type) {
    case "p":
      return `<p>${children}</p>`;
    case "h1":
      return `<h1>${children}</h1>`;
    case "h2":
      return `<h2>${children}</h2>`;
    case "h3":
      return `<h3>${children}</h3>`;
    case "h4":
      return `<h4>${children}</h4>`;
    case "h5":
      return `<h5>${children}</h5>`;
    case "h6":
      return `<h6>${children}</h6>`;
    case "blockquote":
      return `<blockquote>${children}</blockquote>`;
    case "ul":
      return `<ul>${children}</ul>`;
    case "ol":
      return `<ol>${children}</ol>`;
    case "li":
      return `<li>${children}</li>`;
    case "code":
      return `<code>${children}</code>`;
    default:
      return children;
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
