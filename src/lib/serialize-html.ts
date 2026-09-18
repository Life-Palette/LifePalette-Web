/* biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: this existing integration requires the current implementation */
import type { Value } from "platejs";

interface SlateNode {
  bold?: boolean;
  children?: SlateNode[];
  italic?: boolean;
  text?: string;
  type?: string;
  underline?: boolean;
  url?: string;
}

/**
 * 将 Plate Value 转换为 HTML 字符串
 * @param nodes - Plate Value (Slate 节点数组)
 * @returns HTML 字符串
 */
export function serializeToHtml(nodes: Value): string {
  return nodes.map((node) => serializeNode(node as SlateNode)).join("");
}

function serializeNode(node: SlateNode): string {
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

  const children = node.children?.map(serializeNode).join("") || "";

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
    "'": "&#039;",
    '"': "&quot;",
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * 将 HTML 字符串转换为 Plate Value
 * @param html - HTML 字符串
 * @returns Plate Value (Slate 节点数组)
 */
export function deserializeHtml(html: string): Value {
  if (!html.trim()) {
    return [{ children: [{ text: "" }], type: "p" }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const nodes = Array.from(doc.body.childNodes);

  const raw = nodes.map(deserializeNode).filter(Boolean);
  // 扁平化：deserializeNode 可能对 inline marks（bold/italic/u）返回数组
  const result = (raw.flat(1) as Value).filter(Boolean);
  // 确保顶级节点都是 block（有 type 字段），内联文本节点提升为段落
  const blocks: Value = result.map((node: SlateNode) => {
    if (!node.type) {
      return { children: [node], type: "p" };
    }
    return node;
  });
  return blocks.length > 0 ? blocks : [{ children: [{ text: "" }], type: "p" }];
}

function deserializeNode(node: Node): SlateNode | SlateNode[] | null {
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
        return { children: validChildren, type: "p" };
      case "a":
        return {
          children: validChildren,
          type: "a",
          url: el.getAttribute("href") || "",
        };
      case "strong":
      case "b":
        // 若只有一个文本子节点，直接打 mark；否则包一个 p
        if (validChildren.length === 1 && "text" in validChildren[0]) {
          return { ...validChildren[0], bold: true };
        }
        return validChildren.map((child) => ({ ...child, bold: true }));
      case "em":
      case "i":
        if (validChildren.length === 1 && "text" in validChildren[0]) {
          return { ...validChildren[0], italic: true };
        }
        return validChildren.map((child) => ({ ...child, italic: true }));
      case "u":
        if (validChildren.length === 1 && "text" in validChildren[0]) {
          return { ...validChildren[0], underline: true };
        }
        return validChildren.map((child) => ({
          ...child,
          underline: true,
        }));
      case "br":
        return { text: "\n" };
      default:
        // 其他标签当作段落处理
        return { children: validChildren, type: "p" };
    }
  }

  return null;
}
