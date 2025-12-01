import { LogIn, User } from "lucide-react";
import { MESSAGES } from "@/constants/messages";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface UserStatusProps {
  onLogin: () => void;
  className?: string;
}

export default function UserStatus({ onLogin, className = "" }: UserStatusProps) {
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-4 w-4 animate-pulse rounded-full bg-gray-300" />
        <span className="text-gray-500 text-sm">{MESSAGES.STATUS.LOADING}</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
          <User className="text-green-600" size={14} />
        </div>
        <span className="text-gray-700 text-sm">{MESSAGES.STATUS.WELCOME(user.name)}</span>
      </div>
    );
  }

  return (
    <button
      className={`flex items-center gap-2 text-gray-500 text-sm transition-colors hover:text-gray-700 ${className}`}
      onClick={onLogin}
    >
      <LogIn size={14} />
      <span>{MESSAGES.STATUS.CLICK_TO_LOGIN}</span>
    </button>
  );
}
