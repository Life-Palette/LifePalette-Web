import { type ReactNode, useState } from "react";
import LoginModal from "@/components/auth/LoginModal";
import BackToTop from "@/components/common/BackToTop";
import FloatingNavBar from "@/components/layout/FloatingNavBar";
import Header from "@/components/layout/Header";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface PageLayoutProps {
  activeTab: "home" | "trending" | "search" | "likes" | "saved" | "profile" | "chat" | "colors" | "publish";
  authFallback?: ReactNode;
  children: ReactNode;
  requireAuth?: boolean;
  title?: string;
}

export default function PageLayout({
  activeTab,
  children,
  requireAuth = false,
  authFallback,
}: PageLayoutProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { isAuthenticated } = useIsAuthenticated();

  const handleLoginSuccess = () => {
    // 登录成功后的处理
  };

  if (requireAuth && !isAuthenticated && authFallback) {
    return (
      <>
        <Header
          activeTab={activeTab}
          onLogin={() => setIsLoginModalOpen(true)}
        />
        <main className="min-h-screen pt-20 pb-24">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">{authFallback}</div>
        </main>
        <FloatingNavBar activeTab={activeTab} onLogin={() => setIsLoginModalOpen(true)} />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Header
        activeTab={activeTab}
        onLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="min-h-screen pt-20 pb-24">{children}</main>

      <FloatingNavBar activeTab={activeTab} onLogin={() => setIsLoginModalOpen(true)} />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <BackToTop />
    </>
  );
}
