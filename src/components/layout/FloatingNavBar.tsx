import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Palette, Plus, Search, User } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface FloatingNavBarProps {
  activeTab: string;
  onLogin: () => void;
}

export default function FloatingNavBar({ activeTab, onLogin }: FloatingNavBarProps) {
  const { isAuthenticated } = useIsAuthenticated();

  // TODO: 暂时屏蔽聊天功能
  // const { data: roomsData } = useQuery({
  //   queryKey: ["chatRooms"],
  //   queryFn: () => apiService.getChatRooms({ page: 1, size: 50 }),
  //   enabled: isAuthenticated,
  //   refetchInterval: 30000,
  // });
  // const unreadCount =
  //   roomsData?.result?.list?.reduce((sum, room) => sum + (room.unreadCount || 0), 0) || 0;

  const navItems = [
    { id: "home", icon: Home, label: "首页", requireAuth: false, path: "/" },
    {
      id: "search",
      icon: Search,
      label: "发现",
      requireAuth: false,
      path: "/search",
    },
    // 中间留给发布按钮
    {
      id: "colors",
      icon: Palette,
      label: "色集",
      requireAuth: true,
      path: "/colors",
    },
    {
      id: "profile",
      icon: User,
      label: "我的",
      requireAuth: true,
      path: "/profile",
    },
  ];

  const navigate = useNavigate();
  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  const handleTabClick = (requireAuth: boolean) => {
    if (requireAuth && !isAuthenticated) {
      onLogin();
    }
  };

  const renderNavItem = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const isDisabled = item.requireAuth && !isAuthenticated;

    if (isDisabled) {
      return (
        <button
          className="relative cursor-pointer rounded-full p-3 text-muted-foreground/50 transition-all duration-300 hover:text-muted-foreground"
          key={item.id}
          onClick={() => handleTabClick(item.requireAuth)}
          type="button"
        >
          <Icon size={18} />
          <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive/50" />
        </button>
      );
    }

    const hasBadge = "badge" in item && item.badge && item.badge > 0;

    return (
      <Link
        className={`relative rounded-full p-3 transition-all duration-300 ${
          isActive
            ? "scale-110 bg-primary text-primary-foreground shadow-lg shadow-primary/25"
            : "text-muted-foreground hover:scale-105 hover:bg-accent hover:text-foreground"
        }`}
        key={item.id}
        preload="intent"
        search={item.id === "profile" ? { userId: undefined } : undefined}
        title={item.label}
        to={item.path}
      >
        <Icon className={isActive ? "drop-shadow-sm" : ""} size={18} />
        {isActive && (
          <div className="absolute -top-1 left-1/2 h-1 w-1 -translate-x-1/2 transform animate-pulse rounded-full bg-current" />
        )}
        {hasBadge && (
          <div className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1">
            <span className="font-bold text-[10px] text-destructive-foreground leading-none">
              {item.badge! > 99 ? "99+" : item.badge}
            </span>
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform">
      <div className="rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-2xl backdrop-blur-xl dark:bg-background/80">
        <div className="flex items-center gap-2">
          {leftItems.map(renderNavItem)}

          {/* 中间发布按钮 */}
          <button
            className={`relative -my-1 mx-1 flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-background transition-all duration-300 hover:scale-110 active:scale-95 ${
              activeTab === "publish"
                ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25"
                : "border border-border/60 bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            onClick={() => {
              if (isAuthenticated) {
                navigate({ to: "/publish" });
              } else {
                onLogin();
              }
            }}
            title="发布"
            type="button"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>

          {rightItems.map(renderNavItem)}
        </div>
      </div>
    </div>
  );
}
