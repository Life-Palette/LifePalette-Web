import PageLayout from "@/components/layout/PageLayout";
import SearchPage from "@/components/search/SearchPage";

export default function SearchPageWrapper() {
  return (
    <PageLayout activeTab="search">
      <SearchPage />
    </PageLayout>
  );
}
