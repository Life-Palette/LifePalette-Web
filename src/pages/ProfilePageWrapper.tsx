import { useSearch } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useEffect, useLayoutEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import ProfilePage from "@/components/profile/ProfilePage";

const AuthFallback = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <User className="mx-auto mb-4 text-gray-300" size={48} />
      <h3 className="mb-2 font-semibold text-gray-600 text-lg">请先登录</h3>
      <p className="mb-6 text-gray-500">登录后查看个人中心</p>
    </div>
  </div>
);

export default function ProfilePageWrapper() {
  const search = useSearch({ from: "/profile" });
  const userId = search.userId;

  // 使用 useLayoutEffect 在浏览器绘制前恢复滚动位置，避免闪烁
  useLayoutEffect(() => {
    const scrollKey = `profile-scroll-${userId || "self"}`;
    const savedScroll = sessionStorage.getItem(scrollKey);

    if (savedScroll) {
      // 直接设置滚动位置，不使用 scrollTo 避免触发滚动事件
      document.documentElement.scrollTop = Number(savedScroll);
      document.body.scrollTop = Number(savedScroll); // 兼容旧浏览器
    }
  }, [userId]);

  // 保存滚动位置
  useEffect(() => {
    const scrollKey = `profile-scroll-${userId || "self"}`;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      sessionStorage.setItem(scrollKey, String(scrollY));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [userId]);

  // 如果查看其他用户的个人中心，不需要登录验证
  const requireAuth = !userId;

  return (
    <PageLayout activeTab="profile" authFallback={<AuthFallback />} requireAuth={requireAuth}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfilePage userId={userId} />
      </div>
    </PageLayout>
  );
}
