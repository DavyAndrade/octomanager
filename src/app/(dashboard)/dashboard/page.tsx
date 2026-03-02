import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/repos/search-bar";
import { FilterBar } from "@/components/repos/filter-bar";
import { RepoList } from "@/components/repos/repo-list";
import { RepoListSkeleton } from "@/components/repos/repo-list-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Repositories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your GitHub repositories
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar />
          <FilterBar />
        </div>

        {/* Repo list with Suspense */}
        <Suspense fallback={<RepoListSkeleton />}>
          <RepoList />
        </Suspense>
      </div>
    </TooltipProvider>
  );
}
