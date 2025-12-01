/**
 * AI 服务配置
 * 支持多种 AI 服务提供商
 */

export type AIProvider = "deepseek" | "siliconflow" | "openai" | "zhipu";

export interface AIConfig {
  baseURL: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

/**
 * AI 服务提供商配置
 */
export const AI_PROVIDERS: Record<AIProvider, Omit<AIConfig, "temperature" | "maxTokens">> = {
  deepseek: {
    baseURL: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
  siliconflow: {
    baseURL: "https://api.siliconflow.cn",
    model: "Qwen/Qwen2.5-7B-Instruct",
  },
  openai: {
    baseURL: "https://api.openai.com",
    model: "gpt-3.5-turbo",
  },
  zhipu: {
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
    model: "glm-4-flash",
  },
};

/**
 * 获取当前使用的 AI 提供商
 */
export function getAIProvider(): AIProvider {
  const provider = import.meta.env.VITE_AI_PROVIDER as AIProvider;
  return provider || "deepseek";
}

/**
 * 获取 AI API Key
 */
export function getAIApiKey(): string | undefined {
  return import.meta.env.VITE_AI_API_KEY;
}

/**
 * 获取完整的 AI 配置
 */
export function getAIConfig(overrides?: Partial<AIConfig>): AIConfig {
  const provider = getAIProvider();
  const providerConfig = AI_PROVIDERS[provider];

  return {
    ...providerConfig,
    temperature: 0.7,
    maxTokens: 1024,
    ...overrides,
  };
}

/**
 * 构建 AI API 请求 URL
 */
export function getAIApiURL(endpoint: string = "/chat/completions"): string {
  const config = getAIConfig();
  return `${config.baseURL}/v1${endpoint}`;
}
