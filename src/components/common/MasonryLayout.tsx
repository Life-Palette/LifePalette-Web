import { Children, type ReactNode, useMemo } from "react";

interface MasonryLayoutProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
  className?: string;
}

export default function MasonryLayout({
  children,
  columns = 3,
  gap = 16,
  className = "",
}: MasonryLayoutProps) {
  const items = Children.toArray(children);

  // 将子元素分配到各列（横向优先）
  const columnItems = useMemo(() => {
    const cols: ReactNode[][] = Array.from({ length: columns }, () => []);

    items.forEach((item, index) => {
      // 横向分配：按顺序分配到各列
      const columnIndex = index % columns;
      cols[columnIndex].push(item);
    });

    return cols;
  }, [items, columns]);

  return (
    <div className={`flex ${className}`} style={{ gap: `${gap}px` }}>
      {columnItems.map((columnChildren, columnIndex) => (
        <div className="flex flex-1 flex-col" key={columnIndex} style={{ gap: `${gap}px` }}>
          {columnChildren}
        </div>
      ))}
    </div>
  );
}
