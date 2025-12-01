import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiService } from "@/services/api";
import { generateQRCodeImage } from "@/utils/qrcode";

interface UseQRCodeLoginOptions {
  enabled: boolean;
  onSuccess: () => void;
}

interface UseQRCodeLoginReturn {
  qrImageUrl: string;
  qrStatus: "pending" | "confirm" | "timeout" | "success";
  isLoading: boolean;
  error: string | null;
  refreshQRCode: () => Promise<void>;
}

export function useQRCodeLogin(options: UseQRCodeLoginOptions): UseQRCodeLoginReturn {
  const { enabled, onSuccess } = options;
  const queryClient = useQueryClient();

  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrStatus, setQrStatus] = useState<"pending" | "confirm" | "timeout" | "success">(
    "pending",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrKeyRef = useRef("");
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理轮询定时器
  const clearPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // 检查二维码状态
  const checkStatus = useCallback(async () => {
    if (!qrKeyRef.current) return;

    try {
      const response = await apiService.checkQRCodeStatus(qrKeyRef.current);

      if (response.code === 200 && response.result) {
        const result = response.result;
        const status = result.status;
        setQrStatus(status);

        if (status === "timeout") {
          clearPolling();
        } else if (status === "success") {
          clearPolling();
          // 保存token - API返回的数据直接在result中，不在data字段
          if (result.token?.access_token) {
            apiService.setToken(result.token.access_token);
            // 刷新用户信息
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            queryClient.invalidateQueries({ queryKey: ["topics"] });
            // 调用成功回调
            onSuccess();
          }
        }
      }
    } catch (err) {
      console.error("Check QR status failed:", err);
    }
  }, [clearPolling, onSuccess, queryClient]);

  // 启动轮询
  const startPolling = useCallback(() => {
    clearPolling();
    pollingTimerRef.current = setInterval(checkStatus, 2000);
  }, [checkStatus, clearPolling]);

  // 生成二维码
  const generateQRCode = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.generateQRCode();

      if (response.code === 200 && response.result) {
        const { key } = response.result;
        qrKeyRef.current = key;

        // 生成二维码图片
        const imageUrl = await generateQRCodeImage({ key });
        setQrImageUrl(imageUrl);
        setQrStatus("pending");

        // 启动轮询
        startPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "二维码生成失败");
    } finally {
      setIsLoading(false);
    }
  }, [startPolling]);

  // 刷新二维码 - 重新生成新的二维码
  const refreshQRCode = useCallback(async () => {
    // 清理旧的轮询
    clearPolling();

    setIsLoading(true);
    setError(null);

    try {
      // 直接调用生成接口，获取新的key
      const response = await apiService.generateQRCode();

      if (response.code === 200 && response.result) {
        const { key } = response.result;
        qrKeyRef.current = key;

        // 生成新的二维码图片
        const imageUrl = await generateQRCodeImage({ key });
        setQrImageUrl(imageUrl);
        setQrStatus("pending");

        // 重新启动轮询
        startPolling();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "二维码生成失败");
    } finally {
      setIsLoading(false);
    }
  }, [clearPolling, startPolling]);

  // 当enabled变化时，生成或清理二维码
  useEffect(() => {
    if (enabled) {
      generateQRCode();
    } else {
      clearPolling();
    }

    return () => {
      clearPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    qrImageUrl,
    qrStatus,
    isLoading,
    error,
    refreshQRCode,
  };
}
