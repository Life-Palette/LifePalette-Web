import type { AxiosRequestConfig } from 'axios'
import type { MaybeRef } from 'vue'
import type { ApiResponse } from '@/utils/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { del, get, post, put } from '@/utils/api'

// Query hooks
export function useGetQuery<T = any>(
  key: MaybeRef<string | string[]>,
  url: MaybeRef<string>,
  params?: MaybeRef<any>,
  options?: {
    enabled?: MaybeRef<boolean>
    staleTime?: number
    gcTime?: number
    refetchOnWindowFocus?: boolean
    retry?: number | boolean
    select?: (data: ApiResponse<T>) => any
  },
) {
  return useQuery({
    queryKey: computed(() => {
      const keyValue = unref(key)
      return Array.isArray(keyValue) ? keyValue : [keyValue]
    }),
    queryFn: () => get<T>(unref(url), unref(params)),
    enabled: computed(() => unref(options?.enabled ?? true)),
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    retry: options?.retry,
    select: options?.select,
  })
}

// Mutation hooks
export function usePostMutation<T = any, D = any>(
  options?: {
    onSuccess?: (data: ApiResponse<T>) => void
    onError?: (error: any) => void
    onSettled?: () => void
  },
) {
  return useMutation({
    mutationFn: ({ url, data, config }: { url: string, data?: D, config?: AxiosRequestConfig }) =>
      post<T>(url, data, config),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
  })
}

export function usePutMutation<T = any, D = any>(
  options?: {
    onSuccess?: (data: ApiResponse<T>) => void
    onError?: (error: any) => void
    onSettled?: () => void
  },
) {
  return useMutation({
    mutationFn: ({ url, data, config }: { url: string, data?: D, config?: AxiosRequestConfig }) =>
      put<T>(url, data, config),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
  })
}

export function useDeleteMutation<T = any>(
  options?: {
    onSuccess?: (data: ApiResponse<T>) => void
    onError?: (error: any) => void
    onSettled?: () => void
  },
) {
  return useMutation({
    mutationFn: ({ url, config }: { url: string, config?: AxiosRequestConfig }) =>
      del<T>(url, config),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    onSettled: options?.onSettled,
  })
}

// 通用的 invalidate queries helper
export function useInvalidateQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateAll: () => queryClient.invalidateQueries(),
    invalidateByKey: (key: string | string[]) =>
      queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] }),
    refetchByKey: (key: string | string[]) =>
      queryClient.refetchQueries({ queryKey: Array.isArray(key) ? key : [key] }),
  }
}
