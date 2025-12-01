import { useCallback, useEffect, useRef, useState } from "react";
import { getAIApiKey, getAIApiURL, getAIConfig } from "@/config/ai";

interface UseAICompletionOptions {
  enabled?: boolean;
  debounceMs?: number;
  minChars?: number;
  apiKey?: string;
}

export function useAICompletion(options: UseAICompletionOptions = {}) {
  const { enabled = true, debounceMs = 1000, minChars = 10, apiKey } = options;

  const [suggestion, setSuggestion] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | undefined>(undefined);

  const fetchCompletion = useCallback(
    async (text: string, context: string = "") => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);

      try {
        const key = apiKey || getAIApiKey();

        if (!key) {
          console.warn("未配置 AI API Key");
          return;
        }

        const config = getAIConfig({ maxTokens: 100 });

        // 构建智能提示词
        const prompt = `你是一个智能写作助手。用户正在写作，请根据上下文预测并补全接下来可能要写的内容。

上下文：
${context}

当前正在写：
${text}

请直接返回补全的内容（1-2句话），不要重复用户已经写的内容，不要添加解释。如果无法预测，返回空字符串。`;

        const response = await fetch(getAIApiURL(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              {
                role: "system",
                content:
                  "你是一个智能写作助手，帮助用户补全文本。只返回补全内容，不要重复已有内容。",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
            stream: false,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`API 请求失败: ${response.statusText}`);
        }

        const data = await response.json();
        const completion = data.choices[0]?.message?.content?.trim() || "";

        // 只有在有实际内容时才设置建议
        if (completion && completion.length > 0) {
          setSuggestion(completion);
        } else {
          setSuggestion("");
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("获取补全失败:", error);
          setSuggestion("");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey],
  );

  const requestCompletion = useCallback(
    (text: string, context: string = "") => {
      if (!enabled) return;

      // 清除之前的定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 清空当前建议
      setSuggestion("");

      // 检查文本长度
      if (text.length < minChars) {
        return;
      }

      // 防抖处理
      debounceTimerRef.current = setTimeout(() => {
        fetchCompletion(text, context);
      }, debounceMs);
    },
    [enabled, debounceMs, minChars, fetchCompletion],
  );

  const acceptSuggestion = useCallback(() => {
    const currentSuggestion = suggestion;
    setSuggestion("");
    return currentSuggestion;
  }, [suggestion]);

  const dismissSuggestion = useCallback(() => {
    setSuggestion("");
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestion,
    isLoading,
    requestCompletion,
    acceptSuggestion,
    dismissSuggestion,
  };
}
