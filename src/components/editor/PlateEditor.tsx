"use client";

import { BoldPlugin, ItalicPlugin, UnderlinePlugin } from "@platejs/basic-nodes/react";
import { LinkPlugin } from "@platejs/link/react";
import { Bold, Italic, Link, Sparkles, Underline } from "lucide-react";
import type { Value } from "platejs";
import { Plate, usePlateEditor } from "platejs/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type AIAction, AIToolbar } from "@/components/editor/AIToolbar";
import { GhostText } from "@/components/editor/GhostText";
import { Editor, EditorContainer } from "@/components/ui/editor";
import { FixedToolbar } from "@/components/ui/fixed-toolbar";
import { LinkElement } from "@/components/ui/link-element";
import { LinkToolbarButton } from "@/components/ui/link-toolbar-button";
import { MarkToolbarButton } from "@/components/ui/mark-toolbar-button";
import { Separator } from "@/components/ui/separator";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { useAICompletion } from "@/hooks/useAICompletion";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface PlateEditorProps {
  value: Value;
  onChange: (value: Value) => void;
  placeholder?: string;
  enableAI?: boolean;
  enableCompletion?: boolean;
}

export function PlateEditor({
  value,
  onChange,
  placeholder,
  enableAI = true,
  enableCompletion = true,
}: PlateEditorProps) {
  const { user } = useIsAuthenticated();
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      LinkPlugin.configure({
        render: {
          node: LinkElement,
        },
      }),
    ],
    value,
  });

  // AI 智能补全
  const {
    suggestion,
    isLoading: isCompletionLoading,
    requestCompletion,
    acceptSuggestion,
    dismissSuggestion,
  } = useAICompletion({
    enabled: enableCompletion && enableAI,
    debounceMs: 1500,
    minChars: 1,
  });

  const { processText } = useAIAssistant({
    onSuccess: (result) => {
      // 使用 Plate API 删除选中内容并插入新文本
      if (editor.selection) {
        // 删除选中的文本
        editor.tf.delete();
        // 插入 AI 处理后的文本
        editor.tf.insertText(result);

        // 触发 onChange 更新父组件状态
        const newValue = editor.children as Value;
        onChange(newValue);
      }
      setIsAIProcessing(false);
    },
    onError: () => {
      setIsAIProcessing(false);
    },
  });

  const handleAIAction = async (action: AIAction, selectedText: string) => {
    setIsAIProcessing(true);
    toast.loading("AI 正在处理中...", { id: "ai-processing" });

    await processText(action, selectedText);

    toast.dismiss("ai-processing");
  };

  // 监听编辑器内容变化，触发智能补全
  useEffect(() => {
    if (!enableCompletion || !enableAI) return;

    // 获取当前文本内容
    const getText = () => {
      const nodes = editor.children;
      let text = "";

      nodes.forEach((node: any) => {
        if (node.children) {
          node.children.forEach((child: any) => {
            if (child.text) {
              text += child.text;
            }
          });
        }
      });

      return text;
    };

    const text = getText();

    // 获取最后一段文本作为上下文
    const lines = text.split("\n");
    const lastLine = lines[lines.length - 1] || "";
    const context = lines.slice(0, -1).join("\n");

    // 请求补全
    if (lastLine.trim()) {
      requestCompletion(lastLine, context);
    }
  }, [value, enableCompletion, enableAI, editor, requestCompletion]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab 键接受建议
      if (e.key === "Tab" && suggestion) {
        e.preventDefault();
        const accepted = acceptSuggestion();

        if (accepted) {
          // 使用 Plate API 插入文本
          editor.tf.insertText(accepted);

          // 手动触发 onChange 以更新父组件状态
          const newValue = editor.children as Value;
          onChange(newValue);
        }
      }

      // Escape 键取消建议
      if (e.key === "Escape" && suggestion) {
        e.preventDefault();
        dismissSuggestion();
      }
    };

    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.addEventListener("keydown", handleKeyDown);
      return () => editorElement.removeEventListener("keydown", handleKeyDown);
    }
  }, [suggestion, acceptSuggestion, dismissSuggestion, editor, onChange]);

  return (
    <Plate editor={editor} onChange={({ value }) => onChange(value)}>
      <div
        ref={editorRef}
        className="w-full overflow-hidden rounded-xl border-0 bg-secondary/30 transition-all focus-within:bg-background focus-within:ring-2 focus-within:ring-ring/20"
      >
        <FixedToolbar className="flex justify-between items-center gap-1 border-0 border-b border-border bg-transparent px-3 py-2">
          <div className="flex items-center gap-1">
            <MarkToolbarButton nodeType="bold" tooltip="粗体 (⌘+B)">
              <Bold size={16} />
            </MarkToolbarButton>
            <MarkToolbarButton nodeType="italic" tooltip="斜体 (⌘+I)">
              <Italic size={16} />
            </MarkToolbarButton>
            <MarkToolbarButton nodeType="underline" tooltip="下划线 (⌘+U)">
              <Underline size={16} />
            </MarkToolbarButton>
            {user?.id === 32 && (
              <LinkToolbarButton tooltip="链接 (⌘+K)">
                <Link size={16} />
              </LinkToolbarButton>
            )}

            {enableAI && (
              <>
                <Separator orientation="vertical" className="mx-1 h-6" />
                <AIToolbar onAIAction={handleAIAction} disabled={isAIProcessing} />
              </>
            )}
          </div>

          {/* AI 补全状态指示 */}
          {enableCompletion && enableAI && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isCompletionLoading && (
                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>AI 思考中...</span>
                </div>
              )}
              {suggestion && !isCompletionLoading && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Sparkles className="h-3 w-3" />
                  <span>按 Tab 接受建议</span>
                </div>
              )}
            </div>
          )}
        </FixedToolbar>

        <EditorContainer className="w-full border-0 bg-transparent relative">
          <Editor
            className="min-h-[120px] w-full px-4 py-3 text-base"
            placeholder={placeholder}
            variant="none"
          />

          {/* Copilot 风格的 Ghost Text - 内联显示在光标后 */}
          {suggestion && enableCompletion && <GhostText suggestion={suggestion} />}
        </EditorContainer>
      </div>
    </Plate>
  );
}
