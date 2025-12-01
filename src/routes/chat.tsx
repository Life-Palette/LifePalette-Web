import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// 懒加载聊天页面
const ChatPage = lazy(() => import("../pages/ChatPage"));

export const Route = createFileRoute("/chat")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <ChatPage />
    </Suspense>
  ),
});
