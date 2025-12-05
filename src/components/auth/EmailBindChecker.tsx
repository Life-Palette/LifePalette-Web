import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useAuth";
import BindEmailModal from "./BindEmailModal";

const EMAIL_BIND_DISMISSED_KEY = "email_bind_dismissed";
const EMAIL_BIND_DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24小时后再次提醒

export default function EmailBindChecker() {
  const { data: user, isLoading } = useCurrentUser();
  const [showBindModal, setShowBindModal] = useState(false);

  useEffect(() => {
    // 用户信息加载完成后检查是否需要绑定邮箱
    if (isLoading || !user) {
      return;
    }

    // 如果用户已经绑定了邮箱，不显示弹窗
    if (user.email) {
      return;
    }

    // 检查用户是否最近已经关闭过提醒
    const dismissedTime = localStorage.getItem(`${EMAIL_BIND_DISMISSED_KEY}_${user.id}`);
    if (dismissedTime) {
      const dismissedAt = parseInt(dismissedTime, 10);
      if (Date.now() - dismissedAt < EMAIL_BIND_DISMISS_DURATION) {
        return;
      }
    }

    // 延迟显示弹窗，避免页面加载时立即弹出
    const timer = setTimeout(() => {
      setShowBindModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  // 用户选择稍后再说
  const handleClose = () => {
    if (user) {
      localStorage.setItem(`${EMAIL_BIND_DISMISSED_KEY}_${user.id}`, Date.now().toString());
    }
    setShowBindModal(false);
  };

  // 绑定成功
  const handleSuccess = () => {
    if (user) {
      localStorage.removeItem(`${EMAIL_BIND_DISMISSED_KEY}_${user.id}`);
    }
    setShowBindModal(false);
  };

  if (!user) {
    return null;
  }

  return (
    <BindEmailModal
      isOpen={showBindModal}
      onClose={handleClose}
      onSuccess={handleSuccess}
      userId={user.id}
    />
  );
}
