import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { queryKeys } from "@/constants/query-keys";
import { authApi, http } from "@/services/api";
import { generateQRCodeImage } from "@/utils/qrcode";

interface UseQRCodeLoginOptions {
  enabled: boolean;
  onSuccess: () => void;
}

interface UseQRCodeLoginReturn {
  error: string | null;
  isLoading: boolean;
  qrImageUrl: string;
  qrStatus: "pending" | "confirm" | "timeout" | "success";
  refreshQRCode: () => Promise<void>;
}

export function useQRCodeLogin(options: UseQRCodeLoginOptions): UseQRCodeLoginReturn {
  const { enabled, onSuccess } = options;
  const queryClient = useQueryClient();

  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrStatus, setQrStatus] = useState<"pending" | "confirm" | "timeout" | "success">(
    "pending"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qrKeyRef = useRef("");
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const clearPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  const checkStatus = useCallback(async () => {
    if (!qrKeyRef.current) {
      return;
    }

    try {
      const response = await authApi.checkQR(qrKeyRef.current);

      if (response.code === 200 && response.result) {
        const result = response.result;
        const status = result.status;
        setQrStatus(status);

        if (status === "timeout") {
          clearPolling();
        } else if (status === "success") {
          clearPolling();
          if (result.token?.access_token) {
            http.setToken(result.token.access_token);
            queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
            queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
            onSuccessRef.current();
          }
        }
      }
    } catch (err) {
      console.error("Check QR status failed:", err);
    }
  }, [clearPolling, queryClient]);

  const startPolling = useCallback(() => {
    clearPolling();
    pollingTimerRef.current = setInterval(checkStatus, 2000);
  }, [checkStatus, clearPolling]);

  const doGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.generateQR();

      if (response.code === 200 && response.result) {
        const { key } = response.result;
        qrKeyRef.current = key;
        const imageUrl = await generateQRCodeImage({ key });
        setQrImageUrl(imageUrl);
        setQrStatus("pending");
        startPolling();
      } else {
        setError("二维码生成失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "二维码生成失败");
    } finally {
      setIsLoading(false);
    }
  }, [startPolling]);

  const refreshQRCode = useCallback(async () => {
    clearPolling();
    await doGenerate();
  }, [clearPolling, doGenerate]);

  // Only trigger on `enabled` change, not on callback identity changes
  const initializedRef = useRef(false);
  useEffect(() => {
    if (enabled) {
      if (!initializedRef.current) {
        initializedRef.current = true;
        doGenerate();
      }
    } else {
      initializedRef.current = false;
      clearPolling();
      setQrImageUrl("");
      setQrStatus("pending");
      qrKeyRef.current = "";
    }
    return () => {
      clearPolling();
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    qrImageUrl,
    qrStatus,
    isLoading,
    error,
    refreshQRCode,
  };
}
