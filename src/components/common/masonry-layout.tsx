import { Children, type ReactNode, useMemo } from "react";

interface MasonryLayoutProps {
  children: ReactNode[];
  className?: string;
  columns?: number;
  gap?: number;
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
    const cols = Array.from({ length: columns }, (_, columnIndex) => ({
      items: [] as ReactNode[],
      key: `column-${columnIndex}`,
    }));

    items.forEach((item, index) => {
      // 横向分配：按顺序分配到各列
      const columnIndex = index % columns;
      cols[columnIndex].items.push(item);
    });

    return cols;
  }, [items, columns]);

  return (
    <div className={`flex ${className}`} style={{ gap: `${gap}px` }}>
      {columnItems.map((column) => (
        <div
          className="flex flex-1 flex-col"
          key={column.key}
          style={{ gap: `${gap}px` }}
        >
          {column.items}
        </div>
      ))}
    </div>
  );
}
