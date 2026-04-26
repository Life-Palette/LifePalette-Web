import { config } from "@/config/env";

// ============ 类型 ============

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  result: T;
}

export interface PageData<T = any> {
  list: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any;
  params?: Record<string, any>;
  skipAuth?: boolean;
}

// ============ 工具函数 ============

/** 构建查询字符串，自动过滤 undefined/null */
function buildQuery(params?: Record<string, any>): string {
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
export function adaptPage<T>(raw: any): PageData<T> {
  return {
    list: raw?.list || [],
    page: raw?.page || 1,
    pageSize: raw?.page_size || 10,
    total: raw?.total || 0,
    totalPages: raw?.total_pages || 1,
  };
}

// ============ HTTP 客户端 ============

class Http {
  private baseURL: string;

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

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
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
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // 204 No Content
    if (res.status === 204) {
      return { code: 200, message: "success", result: null as any };
    }

    // 401 清 token
    if (res.status === 401) {
      this.clearToken();
      throw new Error("登录已过期，请重新登录");
    }

    const data = await res.json();

    if (!res.ok || (data.code && data.code >= 400)) {
      const msg = Array.isArray(data.msg)
        ? data.msg.map((e: any) => e.message).join(", ")
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

  get<T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET", params });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T = any>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  del<T = any>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const http = new Http(config.API_BASE_URL);
