"use client";

import { LinkPlugin } from "@platejs/link/react";
import { useEditorRef } from "platejs/react";
import { type ChangeEvent, type FormEvent, useCallback, useState } from "react";
import { type Element, Transforms } from "slate";

import { ToolbarButton } from "@/components/ui/toolbar";

export function LinkToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("https://");

  const handleClick = useCallback(() => {
    setUrlInput("https://");
    setIsLinkInputOpen(true);
  }, []);

  const handleUrlChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUrlInput(event.target.value);
    },
    []
  );

  const handleCancel = useCallback(() => {
    setIsLinkInputOpen(false);
  }, []);

  const handleLinkSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const url = urlInput.trim();
      if (!url) {
        return;
      }

      const { selection } = editor;
      if (!selection) {
        return;
      }

      const isCollapsed =
        selection.anchor.offset === selection.focus.offset &&
        selection.anchor.path.join(",") === selection.focus.path.join(",");

      if (isCollapsed) {
        Transforms.insertNodes(editor, {
          children: [{ text: url }],
          type: LinkPlugin.key,
          url,
        } satisfies Element);
      } else {
        Transforms.wrapNodes(
          editor,
          { children: [], type: LinkPlugin.key, url } satisfies Element,
          {
            split: true,
          }
        );
      }
      setIsLinkInputOpen(false);
    },
    [editor, urlInput]
  );

  return (
    <>
      <ToolbarButton {...props} onClick={handleClick} />
      {!!isLinkInputOpen && (
        <form onSubmit={handleLinkSubmit}>
          <label>
            链接地址
            <input autoFocus onChange={handleUrlChange} value={urlInput} />
          </label>
          <button type="submit">确定</button>
          <button onClick={handleCancel} type="button">
            取消
          </button>
        </form>
      )}
    </>
  );
}
