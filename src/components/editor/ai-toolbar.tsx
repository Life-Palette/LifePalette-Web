import { Languages, ListChecks, Sparkles, Wand2 } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIToolbarProps {
  disabled?: boolean;
  onAIAction: (action: AIAction, selectedText: string) => void;
}

export type AIAction = "improve" | "simplify" | "translate" | "summarize";

export function AIToolbar({ onAIAction, disabled }: AIToolbarProps) {
  const handleAction = useCallback(
    (action: AIAction) => {
      // 获取选中的文本
      const selection = window.getSelection();
      const selectedText = selection?.toString() || "";

      if (!selectedText.trim()) {
        toast.error("请先选择要处理的文本");
        return;
      }

      onAIAction(action, selectedText);
    },
    [onAIAction]
  );

  const handleImprove = useCallback(
    () => handleAction("improve"),
    [handleAction]
  );
  const handleSimplify = useCallback(
    () => handleAction("simplify"),
    [handleAction]
  );
  const handleTranslate = useCallback(
    () => handleAction("translate"),
    [handleAction]
  );
  const handleSummarize = useCallback(
    () => handleAction("summarize"),
    [handleAction]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="gap-1.5"
          disabled={disabled}
          size="sm"
          variant="ghost"
        >
          <Sparkles className="h-4 w-4" />
          AI 助手
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={handleImprove}>
          <Wand2 className="mr-2 h-4 w-4" />
          改进文本
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSimplify}>
          <ListChecks className="mr-2 h-4 w-4" />
          简化表达
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTranslate}>
          <Languages className="mr-2 h-4 w-4" />
          翻译为英文
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSummarize}>
          <Sparkles className="mr-2 h-4 w-4" />
          总结内容
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
