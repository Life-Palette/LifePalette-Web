import { useState } from "react";
import { toast } from "sonner";
import type { AIAction } from "@/components/editor/AIToolbar";
import { getAIApiKey, getAIApiURL, getAIConfig } from "@/config/ai";

interface UseAIAssistantOptions {
  apiKey?: string;
  onSuccess?: (result: string) => void;
  onError?: (error: Error) => void;
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const processText = async (action: AIAction, text: string) => {
    setIsProcessing(true);

    try {
      // 这里可以集成你的 AI API
      // 例如：OpenAI, Claude, 或者你自己的后端 AI 服务

      const prompt = getPromptForAction(action, text);

      const apiKey = options.apiKey || getAIApiKey();

      if (!apiKey) {
        toast.error("未配置 AI API Key，请在 .env 文件中设置 VITE_AI_API_KEY");
        return null;
      }

      const config = getAIConfig();

      const response = await fetch(getAIApiURL(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: "system",
              content:
                "你是一个专业的写作助手，帮助用户改进文本。请直接返回处理后的文本，不要添加额外的解释。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API 请求失败: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim();

      if (result) {
        toast.success("AI 处理完成");
        options.onSuccess?.(result);
        return result;
      }

      throw new Error("AI 返回结果为空");
    } catch (error) {
      console.error("AI 处理失败:", error);
      const errorMessage = error instanceof Error ? error.message : "AI 处理失败";
      toast.error(errorMessage);
      options.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processText,
    isProcessing,
  };
}

function getPromptForAction(action: AIAction, text: string): string {
  const prompts: Record<AIAction, string> = {
    improve: `请改进以下文本，使其更加清晰、流畅和专业：\n\n${text}`,
    simplify: `请简化以下文本，使其更容易理解，但保持核心意思不变：\n\n${text}`,
    translate: `请将以下中文文本翻译成英文：\n\n${text}`,
    summarize: `请总结以下文本的核心要点：\n\n${text}`,
  };

  return prompts[action];
}
