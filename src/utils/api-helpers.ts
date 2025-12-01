/**
 * API 辅助工具函数
 */

/**
 * 构建查询字符串
 * @param params 查询参数对象
 * @returns 格式化的查询字符串（包含 ? 前缀，如果有参数的话）
 */
export function buildQueryString(params?: Record<string, any>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // 过滤掉 undefined、null 和空字符串
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * 合并查询参数
 * @param baseParams 基础参数
 * @param additionalParams 额外参数
 * @returns 合并后的参数对象
 */
export function mergeParams<T extends Record<string, any>>(
  baseParams?: T,
  additionalParams?: Partial<T>,
): T | undefined {
  if (!baseParams && !additionalParams) return undefined;
  return { ...baseParams, ...additionalParams } as T;
}

/**
 * 从 API 响应中提取数据
 * @param response API 响应对象
 * @returns 提取的结果数据
 */
export function extractResult<T>(response: { result: T }): T {
  return response.result;
}

/**
 * 检查响应是否成功
 * @param response API 响应对象
 * @returns 是否成功
 */
export function isSuccessResponse(response: { code: number }): boolean {
  return response.code === 200;
}
