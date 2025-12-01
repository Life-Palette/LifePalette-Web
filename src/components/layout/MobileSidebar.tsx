import { Bookmark, Heart, Home, Menu, Search, Settings, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileSidebar({ activeTab, onTabChange }: MobileSidebarProps) {
  const navItems = [
    {
      id: "home",
      icon: Home,
      label: "首页",
      color: "hover:bg-blue-50 hover:text-blue-600",
    },
    {
      id: "search",
      icon: Search,
      label: "发现",
      color: "hover:bg-purple-50 hover:text-purple-600",
    },
    {
      id: "likes",
      icon: Heart,
      label: "喜欢",
      color: "hover:bg-red-50 hover:text-red-600",
    },
    {
      id: "saved",
      icon: Bookmark,
      label: "收藏",
      color: "hover:bg-yellow-50 hover:text-yellow-600",
    },
    {
      id: "trending",
      icon: TrendingUp,
      label: "热门",
      color: "hover:bg-green-50 hover:text-green-600",
    },
  ];

  const hotTopics = ["摄影", "旅行", "美食", "设计", "生活"];

  const SidebarContent = () => (
    <div className="flex h-full flex-col p-6">
      {/* 主导航 */}
      <nav className="mb-8 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Button
              className={`h-auto w-full justify-start gap-4 rounded-2xl px-4 py-3 text-base transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                  : `text-muted-foreground hover:bg-accent/80 hover:text-foreground ${item.color}`
              }`}
              key={item.id}
              onClick={() => onTabChange(item.id)}
              variant={isActive ? "default" : "ghost"}
            >
              <Icon size={20} />
              <span className="font-semibold">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* 统计卡片 */}
      <Card className="mb-8 border border-border bg-card/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-base">
            <div className="rounded-xl bg-primary p-2">
              <Users className="text-primary-foreground" size={16} />
            </div>
            我的数据
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-sm">动态</span>
            <Badge className="rounded-full bg-primary px-2 py-1 text-primary-foreground text-xs hover:bg-primary/90">
              23
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-sm">关注</span>
            <Badge className="rounded-full bg-primary px-2 py-1 text-primary-foreground text-xs hover:bg-primary/90">
              156
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium text-muted-foreground text-sm">粉丝</span>
            <Badge className="rounded-full bg-primary px-2 py-1 text-primary-foreground text-xs hover:bg-primary/90">
              89
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 热门标签 */}
      <div className="flex-1">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-base text-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          热门话题
        </h3>
        <div className="space-y-1">
          {hotTopics.map((tag, index) => (
            <Button
              className="h-auto w-full justify-start rounded-xl px-3 py-2 text-left font-medium text-muted-foreground text-sm transition-all duration-300 hover:bg-accent/80 hover:text-foreground"
              key={index}
              variant="ghost"
            >
              <span className="mr-2 text-green-600">#</span>
              {tag}
            </Button>
          ))}
        </div>
      </div>

      {/* 底部设置 */}
      <div className="border-border border-t pt-4">
        <Button
          className="w-full justify-start gap-3 rounded-2xl px-4 py-3 text-muted-foreground transition-all duration-300 hover:bg-accent/80 hover:text-foreground"
          variant="ghost"
        >
          <Settings size={18} />
          <span className="font-semibold">设置</span>
        </Button>
      </div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="h-9 w-9 md:hidden" size="icon" variant="ghost">
          <Menu size={20} />
          <span className="sr-only">打开菜单</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-80 p-0" side="left">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
