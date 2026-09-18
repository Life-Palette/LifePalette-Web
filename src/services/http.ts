import { config } from "@/config/env";

// ============ 类型 ============

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  result: T;
}

export interface PageData<T = unknown> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, unknown>;
  skipAuth?: boolean;
}

// ============ 工具函数 ============

/** 构建查询字符串，自动过滤 undefined/null */
function buildQuery(params?: Record<string, unknown>): string {
  if (!params) {
    return "";
  }
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      sp.append(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

/** 适配 Go 后端分页响应为统一格式 */
export function adaptPage<T>(raw: unknown): PageData<T> {
  const data =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    list: (data.list as T[] | undefined) || [],
    page: (data.page as number | undefined) || 1,
    pageSize: (data.page_size as number | undefined) || 10,
    total: (data.total as number | undefined) || 0,
    totalPages: (data.total_pages as number | undefined) || 1,
  };
}

// ============ HTTP 客户端 ============

class Http {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    localStorage.setItem("auth_token", token);
  }

  clearToken() {
    localStorage.removeItem("auth_token");
  }

  async request<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { params, body, skipAuth, ...fetchOptions } = options;
    const url = `${this.baseURL}${endpoint}${buildQuery(params)}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const res = await fetch(url, {
      ...fetchOptions,
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });

    // 204 No Content
    if (res.status === 204) {
      return { code: 200, message: "success", result: null as T };
    }

    // 401 清 token
    if (res.status === 401) {
      this.clearToken();
      throw new Error("登录已过期，请重新登录");
    }

    const data = await res.json();

    if (!res.ok || (data.code && data.code >= 400)) {
      const msg = Array.isArray(data.msg)
        ? data.msg.map((e: { message?: string }) => e.message).join(", ")
        : data.msg || data.message || "请求失败";
      throw new Error(msg);
    }

    // Go 后端用 data 字段，统一映射到 result
    return {
      code: data.code || 200,
      message: data.message || "success",
      result: data.data === undefined ? data.result : data.data,
    };
  }

  get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ) {
    return this.request<T>(endpoint, { ...options, method: "GET", params });
  }

  post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ) {
    return this.request<T>(endpoint, { ...options, body, method: "POST" });
  }

  put<T = unknown>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, body, method: "PUT" });
  }

  del<T = unknown>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const http = new Http(config.API_BASE_URL);
