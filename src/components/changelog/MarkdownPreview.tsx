import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import "highlight.js/styles/github-dark.css";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
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
      <h1 className="text-2xl font-bold text-foreground mt-6 mb-4 text-center" id={id} {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    const text = typeof children === "string" ? children : String(children);
    const id = generateId(text);
    return (
      <h2
        className="text-xl font-semibold text-foreground mt-10 mb-5 pb-3 border-b border-border scroll-mt-20"
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
        className="text-lg font-semibold text-foreground mt-10 mb-4 pl-3 border-l-2 border-primary scroll-mt-20"
        id={id}
        {...props}
      >
        {children}
      </h3>
    );
  },
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-6 py-3 px-4 border-l-2 border-muted-foreground/40 bg-muted/30 rounded-r text-muted-foreground italic"
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
      <span className="inline-block w-2 h-2 rounded-full bg-foreground/40 mt-[0.45rem] shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  ),
  hr: ({ ...props }) => <hr className="my-8 border-t border-border/60" {...props} />,
};

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // 标题样式
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-h1:text-2xl prose-h1:mb-4 prose-h1:mt-6 prose-h1:text-center",
        // 段落样式
        "prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5",
        // 列表样式 - 由自定义组件处理
        "prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2",
        // 代码样式
        "prose-code:bg-muted prose-code:text-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono",
        "prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto",
        // 链接样式
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // 强调样式
        "prose-strong:text-foreground prose-strong:font-semibold",
        // 分割线样式
        "prose-hr:border-t prose-hr:border-border prose-hr:my-8",
        // 表格样式
        "prose-table:w-full prose-table:border-collapse",
        "prose-th:bg-muted/50 prose-th:p-2 prose-th:text-left prose-th:font-medium prose-th:border-b prose-th:border-border",
        "prose-td:p-2 prose-td:border-b prose-td:border-border/50",
        className,
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
