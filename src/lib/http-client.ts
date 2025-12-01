import { toast } from "sonner";
import { config } from "@/config/env";

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipErrorToast?: boolean;
}

/**
 * HTTP 客户端类
 * 提供统一的请求拦截、响应处理和错误处理
 */
class HttpClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("auth_token");
  }

  /**
   * 请求拦截器 - 添加认证头和其他配置
   */
  private async beforeRequest(config: RequestConfig): Promise<RequestInit> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(config.headers as Record<string, string>),
    };

    // 添加认证令牌
    if (!config.skipAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return {
      ...config,
      headers,
    };
  }

  /**
   * 响应拦截器 - 处理响应和错误
   */
  private async afterResponse<T>(response: Response, config: RequestConfig): Promise<T> {
    let data: any;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("服务器响应格式错误");
    }

    // 处理 401 未授权
    if (response.status === 401) {
      this.clearToken();
      if (!config.skipErrorToast) {
        toast.error("登录已过期", { description: "请重新登录" });
      }
      // 触发全局登录过期事件
      window.dispatchEvent(new CustomEvent("auth:expired"));
      throw new Error("登录已过期，请重新登录");
    }

    // 处理 403 禁止访问
    if (response.status === 403) {
      if (!config.skipErrorToast) {
        toast.error("权限不足", { description: "您没有权限执行此操作" });
      }
      throw new Error("权限不足");
    }

    // 处理业务错误
    if (!response.ok || data.code !== 200) {
      const errorMessage = this.formatErrorMessage(data);

      if (!config.skipErrorToast) {
        toast.error("操作失败", { description: errorMessage });
      }

      throw new Error(errorMessage);
    }

    return data;
  }

  /**
   * 格式化错误消息
   */
  private formatErrorMessage(data: any): string {
    // 处理字段验证错误（msg 是数组）
    if (Array.isArray(data.msg) && data.msg.length > 0) {
      return data.msg.map((err: any) => err.message).join(", ");
    }

    // 处理普通错误消息
    return data.msg || data.message || "操作失败，请重试";
  }

  /**
   * 发送 HTTP 请求
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = await this.beforeRequest(config);

    try {
      const response = await fetch(url, requestConfig);
      return await this.afterResponse<T>(response, config);
    } catch (error) {
      // 处理网络错误
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        if (!config.skipErrorToast) {
          toast.error("网络错误", { description: "请检查网络连接" });
        }
        throw new Error("网络连接失败，请检查网络");
      }

      // 重新抛出其他错误
      throw error;
    }
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求
   */
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH 请求
   */
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求
   */
  async delete<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * 设置认证令牌
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  /**
   * 清除认证令牌
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  /**
   * 获取当前令牌
   */
  getToken(): string | null {
    return this.token;
  }
}

// 导出单例实例
export const httpClient = new HttpClient(config.API_BASE_URL);
