"use client";

import { useLink } from "@platejs/link/react";
import type { TLinkElement } from "platejs";
import type { PlateElementProps } from "platejs/react";
import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function LinkElement({
  children,
  className,
  element,
  ...props
}: PlateElementProps) {
  const { props: linkProps } = useLink({ element: element as TLinkElement });

  // 过滤掉不应传递给 DOM 的 props
  const { setOption, setOptions, getOption, getOptions, ...restProps } =
    props as PlateElementProps & AnchorHTMLAttributes<HTMLAnchorElement>;

  return (
    <a
      {...linkProps}
      className={cn(
        "cursor-pointer font-medium text-primary underline decoration-primary underline-offset-4",
        className
      )}
      {...restProps}
    >
      {children}
    </a>
  );
}
