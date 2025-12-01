// import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Home, Palette, Search, User } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/useAuth";

// import { apiService } from "@/services/api";

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
    {
      id: "colors",
      icon: Palette,
      label: "色集",
      requireAuth: true,
      path: "/colors",
    },
    // TODO: 暂时屏蔽聊天入口
    // {
    //   id: "chat",
    //   icon: MessageCircle,
    //   label: "消息",
    //   requireAuth: true,
    //   path: "/chat",
    //   badge: unreadCount > 0 ? unreadCount : undefined,
    // },
    {
      id: "profile",
      icon: User,
      label: "我的",
      requireAuth: true,
      path: "/profile",
    },
  ];

  const handleTabClick = (requireAuth: boolean) => {
    if (requireAuth && !isAuthenticated) {
      onLogin();
    }
  };

  return (
    <div className="-translate-x-1/2 fixed bottom-8 left-1/2 z-50 transform">
      <div className="rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-2xl backdrop-blur-xl dark:bg-background/80">
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
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
                  <div className="-top-1 -right-1 absolute h-2 w-2 rounded-full bg-destructive/50" />
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
                  <div className="-top-1 -translate-x-1/2 absolute left-1/2 h-1 w-1 transform animate-pulse rounded-full bg-current" />
                )}
                {hasBadge && (
                  <div className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-destructive px-1">
                    <span className="text-[10px] font-bold leading-none text-destructive-foreground">
                      {item.badge! > 99 ? "99+" : item.badge}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
