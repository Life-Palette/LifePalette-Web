"use client";

import { LinkPlugin } from "@platejs/link/react";
import { useEditorRef } from "platejs/react";
import type * as React from "react";
import { Transforms } from "slate";

import { ToolbarButton } from "@/components/ui/toolbar";

export function LinkToolbarButton(props: React.ComponentProps<typeof ToolbarButton>) {
  const editor = useEditorRef();

  const handleClick = () => {
    const url = window.prompt("请输入链接地址：", "https://");
    if (!url) return;

    const { selection } = editor;
    if (!selection) return;

    const isCollapsed =
      selection.anchor.offset === selection.focus.offset &&
      selection.anchor.path.join(",") === selection.focus.path.join(",");

    if (isCollapsed) {
      Transforms.insertNodes(
        editor as any,
        {
          type: LinkPlugin.key,
          url,
          children: [{ text: url }],
        } as any,
      );
    } else {
      Transforms.wrapNodes(editor as any, { type: LinkPlugin.key, url, children: [] } as any, {
        split: true,
      });
    }
  };

  return <ToolbarButton {...props} onClick={handleClick} />;
}
