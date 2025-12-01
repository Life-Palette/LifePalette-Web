import { Languages, ListChecks, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIToolbarProps {
  onAIAction: (action: AIAction, selectedText: string) => void;
  disabled?: boolean;
}

export type AIAction = "improve" | "simplify" | "translate" | "summarize";

export function AIToolbar({ onAIAction, disabled }: AIToolbarProps) {
  const handleAction = (action: AIAction) => {
    // 获取选中的文本
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";

    if (!selectedText.trim()) {
      toast.error("请先选择要处理的文本");
      return;
    }

    onAIAction(action, selectedText);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled} className="gap-1.5">
          <Sparkles className="h-4 w-4" />
          AI 助手
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleAction("improve")}>
          <Wand2 className="mr-2 h-4 w-4" />
          改进文本
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("simplify")}>
          <ListChecks className="mr-2 h-4 w-4" />
          简化表达
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("translate")}>
          <Languages className="mr-2 h-4 w-4" />
          翻译为英文
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("summarize")}>
          <Sparkles className="mr-2 h-4 w-4" />
          总结内容
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
