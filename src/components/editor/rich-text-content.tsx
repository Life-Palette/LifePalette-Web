import DOMPurify from "dompurify";
import { createElement, type ReactNode } from "react";

interface RichTextContentProps {
  className?: string;
  content: string;
  maxLines?: number;
}

export default function RichTextContent({
  content,
  className = "",
  maxLines,
}: RichTextContentProps) {
  // 配置 DOMPurify 允许的标签和属性
  const cleanHTML = DOMPurify.sanitize(content, {
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
  });

  // 根据 maxLines 生成对应的 line-clamp 类名
  let lineClampClass = "";
  if (maxLines === 3) {
    lineClampClass = "line-clamp-3";
  } else if (maxLines === 5) {
    lineClampClass = "line-clamp-5";
  }

  const document = new DOMParser().parseFromString(cleanHTML, "text/html");
  const renderNode = (node: ChildNode, key: string): ReactNode => {
    if (node.nodeType === 3) {
      return node.textContent;
    }

    if (node.nodeType !== 1) {
      return null;
    }

    const element = node as HTMLElement;
    const attributes: Record<string, string> = {};
    for (const attribute of ["href", "target", "rel"]) {
      const value = element.getAttribute(attribute);
      if (value !== null) {
        attributes[attribute] = value;
      }
    }

    return createElement(
      element.tagName.toLowerCase(),
      { ...attributes, key },
      Array.from(element.childNodes, (child, index) =>
        renderNode(child, `${key}-${index}`)
      )
    );
  };

  return (
    <div className={`rich-text-content ${lineClampClass} ${className}`}>
      {Array.from(document.body.childNodes, (node, index) =>
        renderNode(node, `${index}`)
      )}
    </div>
  );
}
