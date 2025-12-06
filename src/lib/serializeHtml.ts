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
    case "a":
    case "link":
      return `<a href="${escapeHtml(node.url || "")}" target="_blank" rel="noopener noreferrer">${children}</a>`;
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

/**
 * 将 HTML 字符串转换为 Plate Value
 * @param html - HTML 字符串
 * @returns Plate Value (Slate 节点数组)
 */
export function deserializeHtml(html: string): Value {
  if (!html || !html.trim()) {
    return [{ type: "p", children: [{ text: "" }] }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = Array.from(doc.body.childNodes);

  const result = nodes.map(deserializeNode).filter(Boolean) as Value;
  return result.length > 0 ? result : [{ type: "p", children: [{ text: "" }] }];
}

function deserializeNode(node: Node): any {
  // 文本节点
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    return text ? { text } : null;
  }

  // 元素节点
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const children = Array.from(el.childNodes)
      .map(deserializeNode)
      .filter(Boolean);

    // 确保有子节点
    const validChildren = children.length > 0 ? children : [{ text: "" }];

    switch (el.tagName.toLowerCase()) {
      case "p":
        return { type: "p", children: validChildren };
      case "a":
        return {
          type: "a",
          url: el.getAttribute("href") || "",
          children: validChildren,
        };
      case "strong":
      case "b":
        return validChildren.map((child: any) => ({ ...child, bold: true }));
      case "em":
      case "i":
        return validChildren.map((child: any) => ({ ...child, italic: true }));
      case "u":
        return validChildren.map((child: any) => ({ ...child, underline: true }));
      case "br":
        return { text: "\n" };
      default:
        // 其他标签当作段落处理
        return { type: "p", children: validChildren };
    }
  }

  return null;
}
