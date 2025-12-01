import TopicsListPage from "@/components/post/TopicsListPage";

export default function HomePage() {
  return <TopicsListPage activeTab="home" emptyMessage="暂无动态" sortBy="createdAt,desc" />;
}
