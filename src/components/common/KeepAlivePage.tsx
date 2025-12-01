import type { ReactNode } from "react";
import { KeepAlive } from "react-activation";

interface KeepAlivePageProps {
  children: ReactNode;
  name: string;
  when?: boolean;
  enableScrollRestore?: boolean; // 保留参数以兼容现有代码，但不使用
}

export default function KeepAlivePage({ children, name, when = true }: KeepAlivePageProps) {
  return (
    <KeepAlive name={name} when={when}>
      <div className="h-full">{children}</div>
    </KeepAlive>
  );
}
