import type { ReactNode } from "react";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

export default function AuthGuard({ children, fallback, onUnauthorized }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useIsAuthenticated();

  if (isLoading) {
    return null; // 或者返回一个加载状态
  }

  if (!isAuthenticated) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return fallback || null;
  }

  return <>{children}</>;
}
