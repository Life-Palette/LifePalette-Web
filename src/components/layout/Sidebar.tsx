import { Bookmark, Heart, Home, Search, Settings, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
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

  return (
    <aside className="fixed top-24 bottom-0 left-0 w-72 border-border border-r bg-background/80 backdrop-blur-xl">
      <div className="flex h-full flex-col p-8">
        {/* 主导航 */}
        <nav className="mb-10 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Button
                className={`h-auto w-full justify-start gap-5 rounded-3xl px-6 py-4 text-base transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
                    : `text-muted-foreground hover:bg-accent/80 hover:text-foreground ${item.color}`
                }`}
                key={item.id}
                onClick={() => onTabChange(item.id)}
                variant={isActive ? "default" : "ghost"}
              >
                <Icon size={22} />
                <span className="font-semibold">{item.label}</span>
              </Button>
            );
          })}
        </nav>

        {/* 统计卡片 */}
        <Card className="mb-10 border border-border bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-4 text-lg">
              <div className="rounded-2xl bg-primary p-2">
                <Users className="text-primary-foreground" size={20} />
              </div>
              我的数据
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">动态</span>
              <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90">
                23
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">关注</span>
              <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90">
                156
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">粉丝</span>
              <Badge className="rounded-full bg-primary px-3 py-1 text-primary-foreground hover:bg-primary/90">
                89
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 热门标签 */}
        <div className="flex-1">
          <h3 className="mb-6 flex items-center gap-3 font-bold text-foreground text-lg">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            热门话题
          </h3>
          <div className="space-y-2">
            {hotTopics.map((tag, index) => (
              <Button
                className="h-auto w-full justify-start rounded-2xl px-4 py-3 text-left font-medium text-muted-foreground transition-all duration-300 hover:bg-accent/80 hover:text-foreground"
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
        <div className="border-border border-t pt-6">
          <Button
            className="w-full justify-start gap-4 rounded-3xl px-6 py-4 text-muted-foreground transition-all duration-300 hover:bg-accent/80 hover:text-foreground"
            variant="ghost"
          >
            <Settings size={20} />
            <span className="font-semibold">设置</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
