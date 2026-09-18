import PageLayout from "@/components/layout/page-layout";
import SearchPage from "@/components/search/search-page";

export default function SearchPageWrapper() {
  return (
    <PageLayout activeTab="search">
      <SearchPage />
    </PageLayout>
  );
}
