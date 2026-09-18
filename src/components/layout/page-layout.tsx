import { type ReactNode, useCallback, useState } from "react";
import LoginModal from "@/components/auth/login-modal";
import BackToTop from "@/components/common/back-to-top";
import FloatingNavBar from "@/components/layout/floating-nav-bar";
import Header from "@/components/layout/Header";
import { useIsAuthenticated } from "@/hooks/use-auth";

interface PageLayoutProps {
  activeTab:
    | "home"
    | "trending"
    | "search"
    | "likes"
    | "saved"
    | "profile"
    | "chat"
    | "colors"
    | "publish";
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

  const handleLogin = useCallback(() => setIsLoginModalOpen(true), []);
  const handleCloseLogin = useCallback(() => setIsLoginModalOpen(false), []);
  const handleLoginSuccess = useCallback(() => {
    // 登录成功后的处理
  }, []);

  if (requireAuth && !isAuthenticated && authFallback) {
    return (
      <>
        <Header activeTab={activeTab} onLogin={handleLogin} />
        <main className="min-h-screen pt-20 pb-24">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {authFallback}
          </div>
        </main>
        <FloatingNavBar activeTab={activeTab} onLogin={handleLogin} />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={handleCloseLogin}
          onSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <>
      <Header activeTab={activeTab} onLogin={handleLogin} />

      <main className="min-h-screen pt-20 pb-24">{children}</main>

      <FloatingNavBar activeTab={activeTab} onLogin={handleLogin} />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLogin}
        onSuccess={handleLoginSuccess}
      />

      <BackToTop />
    </>
  );
}
