import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";

interface MarkdownPreviewProps {
  className?: string;
  content: string;
}

// 生成标题 ID
function generateId(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // 移除 emoji
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留中文、字母、数字
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

// 自定义渲染组件 - 黑白简约风格
const components: Components = {
  h1: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = generateId(text);
    return (
      <h1 className="mt-6 mb-4 text-center font-bold text-2xl text-foreground" id={id} {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = generateId(text);
    return (
      <h2
        className="mt-10 mb-5 scroll-mt-20 border-border border-b pb-3 font-semibold text-foreground text-xl"
        id={id}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = generateId(text);
    return (
      <h3
        className="mt-10 mb-4 scroll-mt-20 border-primary border-l-2 pl-3 font-semibold text-foreground text-lg"
        id={id}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = generateId(text);
    return (
      <h4
        className="mt-6 mb-3 scroll-mt-20 font-semibold text-base text-foreground"
        id={id}
        {...props}
      >
        {children}
      </h4>
    );
  },
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 rounded-r border-muted-foreground/40 border-l-2 bg-muted/30 px-4 py-3 text-muted-foreground italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }) => (
    <ul className="my-6 space-y-4 pl-2" {...props}>
      {children}
    </ul>
  ),
  li: ({ children, ...props }) => (
    <li className="flex items-start gap-3 text-muted-foreground leading-relaxed" {...props}>
      <span className="mt-[0.45rem] inline-block h-2 w-2 shrink-0 rounded-full bg-foreground/40" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  hr: ({ ...props }) => <hr className="my-8 border-border/60 border-t" {...props} />,
  a: ({ children, href, ...props }) => (
    <a
      className="font-medium text-primary transition-colors hover:underline"
      href={href}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      target={href?.startsWith("http") ? "_blank" : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-muted/50" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="border-border border-b px-4 py-3 text-left font-semibold text-foreground"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-border/50 border-b px-4 py-3 text-muted-foreground" {...props}>
      {children}
    </td>
  ),
  tr: ({ children, ...props }) => (
    <tr className="transition-colors hover:bg-muted/30" {...props}>
      {children}
    </tr>
  ),
};

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // 标题样式
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-h1:mt-6 prose-h1:mb-4 prose-h1:text-center prose-h1:text-2xl",
        // 段落样式
        "prose-p:mb-5 prose-p:text-muted-foreground prose-p:leading-relaxed",
        // 列表样式 - 由自定义组件处理
        "prose-ol:my-5 prose-ol:list-decimal prose-ol:space-y-2 prose-ol:pl-6",
        // 代码样式
        "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-foreground prose-code:text-sm",
        "prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:bg-muted prose-pre:p-4",
        // 链接样式
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // 强调样式
        "prose-strong:font-semibold prose-strong:text-foreground",
        // 分割线样式
        "prose-hr:my-8 prose-hr:border-border prose-hr:border-t",
        // 表格样式
        "prose-table:w-full prose-table:border-collapse",
        "prose-th:border-border prose-th:border-b prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left prose-th:font-medium",
        "prose-td:border-border/50 prose-td:border-b prose-td:p-2",
        className
      )}
    >
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
