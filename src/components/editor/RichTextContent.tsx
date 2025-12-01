import DOMPurify from "dompurify";

interface RichTextContentProps {
  content: string;
  className?: string;
  maxLines?: number;
}

export default function RichTextContent({
  content,
  className = "",
  maxLines,
}: RichTextContentProps) {
  // 配置 DOMPurify 允许的标签和属性
  const cleanHTML = DOMPurify.sanitize(content, {
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
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  // 根据 maxLines 生成对应的 line-clamp 类名
  const lineClampClass = maxLines
    ? maxLines === 3
      ? "line-clamp-3"
      : maxLines === 5
        ? "line-clamp-5"
        : ""
    : "";

  return (
    <div
      className={`rich-text-content ${lineClampClass} ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
}
