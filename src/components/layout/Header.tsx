import { Link } from "@tanstack/react-router";
import { Github, History, LogOut, Plus, Search, User } from "lucide-react";
import { ModeToggle } from "@/components/common/mode-toggle";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsAuthenticated, useLogout } from "@/hooks/useAuth";
import { getUserAvatar } from "@/utils/avatar";

// import { useUnreadCount } from "@/hooks/useNotifications";

interface HeaderProps {
  activeTab: string;
  onCreatePost: () => void;
  onLogin: () => void;
  onTabChange?: (tab: string) => void;
}

export default function Header({ activeTab, onCreatePost, onLogin, onTabChange }: HeaderProps) {
  const { isAuthenticated, user } = useIsAuthenticated();
  const logoutMutation = useLogout();
  // TODO: 暂时屏蔽通知功能
  // const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <TooltipProvider>
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300 dark:bg-background/80 dark:border-white/5">
        <div className="container mx-auto px-4 py-5 md:px-8">
          <div className="flex items-center justify-between">
            {/* 移动端菜单 */}
            <div className="md:hidden">
              <MobileSidebar activeTab={activeTab} onTabChange={onTabChange || (() => {})} />
            </div>

            {/* 简约Logo */}
            <Link className="group flex cursor-pointer items-center gap-3" preload="intent" to="/">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-primary/25 group-hover:rotate-[-10deg]">
                <span className="font-bold text-primary-foreground text-lg italic">L</span>
              </div>
              <h1 className="font-bold text-2xl text-foreground tracking-tight transition-colors group-hover:text-primary">
                Life
              </h1>
            </Link>

            {/* 中央搜索区 */}
            <div className="mx-4 hidden max-w-lg flex-1 sm:block md:mx-8">
              <Link className="block" preload="intent" to="/search">
                <div className="group relative">
                  <Search
                    className="-translate-y-1/2 absolute top-1/2 left-4 transform text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none"
                    size={18}
                  />
                  <Input
                    className="w-full rounded-full border-transparent bg-secondary/50 py-3 pr-4 pl-12 text-sm shadow-sm transition-all hover:bg-secondary/80 hover:shadow-md focus:bg-background focus:border-primary/20 focus:ring-2 focus:ring-primary/20 dark:bg-white/10 dark:hover:bg-white/15 dark:border-white/5 dark:focus:bg-black/40"
                    placeholder="搜索有趣的内容..."
                    readOnly
                    type="text"
                  />
                </div>
              </Link>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-3">
              {/* 主题切换 */}
              <ModeToggle />

              {/* GitHub */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/Life-Palette/LifePalette-Web"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Button
                      className="h-9 w-9 rounded-full border border-border/50 bg-secondary/50 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:border-primary/30 dark:bg-white/5 dark:hover:bg-white/10"
                      size="icon"
                      variant="ghost"
                    >
                      <Github size={18} />
                    </Button>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>GitHub</p>
                </TooltipContent>
              </Tooltip>

              {/* 更新日志入口 */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link preload="intent" to="/changelog">
                    <Button
                      className="relative h-9 w-9 rounded-full border border-border/50 bg-secondary/50 text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground hover:border-primary/30 dark:bg-white/5 dark:hover:bg-white/10"
                      size="icon"
                      variant="ghost"
                    >
                      <History size={18} />
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>更新日志</p>
                </TooltipContent>
              </Tooltip>

              {isAuthenticated ? (
                <>
                  <Button
                    className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground text-sm shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20"
                    onClick={onCreatePost}
                  >
                    <Plus className="mr-2" size={16} />
                    发布
                  </Button>

                  {/* TODO: 暂时屏蔽通知入口
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link preload="intent" to="/notifications">
                        <Button
                          className="relative h-9 w-9 rounded-full text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground dark:hover:bg-white/10"
                          size="icon"
                          variant="ghost"
                        >
                          <Bell size={18} />
                          {unreadCount > 0 && (
                            <Badge
                              className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-white text-xs"
                              variant="destructive"
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>通知</p>
                    </TooltipContent>
                  </Tooltip>
                  */}

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-9 w-9 rounded-full text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive dark:hover:bg-white/10 dark:hover:text-red-400"
                        disabled={logoutMutation.isPending}
                        onClick={() => logoutMutation.mutate()}
                        size="icon"
                        variant="ghost"
                      >
                        <LogOut size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>退出登录</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link preload="intent" search={{ userId: undefined }} to="/profile">
                        <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-border transition-all duration-200 hover:scale-110 hover:ring-ring dark:ring-white/10 dark:hover:ring-primary/50">
                          <AvatarImage src={getUserAvatar(user)} alt={user?.name || "用户头像"} />
                          <AvatarFallback className="bg-muted font-medium text-muted-foreground text-sm dark:bg-white/10">
                            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{user?.name || "个人资料"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              ) : (
                <Button
                  className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground text-sm shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 hover:shadow-xl"
                  onClick={onLogin}
                >
                  登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
