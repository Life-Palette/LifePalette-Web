"use client";

import { useLink } from "@platejs/link/react";
import type { PlateElementProps } from "platejs/react";
import { cn } from "@/lib/utils";

export function LinkElement({ children, className, element, ...props }: PlateElementProps) {
  const { props: linkProps } = useLink({ element: element as any });

  // 过滤掉不应传递给 DOM 的 props
  const { setOption, setOptions, getOption, getOptions, ...restProps } = props as any;

  return (
    <a
      {...linkProps}
      className={cn(
        "font-medium text-primary underline decoration-primary underline-offset-4 cursor-pointer",
        className,
      )}
      {...restProps}
    >
      {children}
    </a>
  );
}
