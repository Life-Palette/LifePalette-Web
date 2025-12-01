import { type ReactNode, useEffect, useState } from "react";
import MasonryLayout from "@/components/common/MasonryLayout";

interface ResponsiveMasonryProps {
  children: ReactNode[];
  gap?: number;
  className?: string;
}

export default function ResponsiveMasonry({
  children,
  gap = 16,
  className = "",
}: ResponsiveMasonryProps) {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumns(1); // 手机端单列
      } else if (width < 1024) {
        setColumns(2); // 平板端双列
      } else if (width < 1280) {
        setColumns(3); // 中等桌面端三列
      } else if (width < 1600) {
        setColumns(4); // 大桌面端四列
      } else {
        setColumns(4); // 超宽屏最多五列
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return (
    <MasonryLayout className={`w-full ${className}`} columns={columns} gap={gap}>
      {children}
    </MasonryLayout>
  );
}
