import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBar } from "@/components/repos/search-bar";
import { ReloadButton } from "@/components/repos/reload-button";
import { Dashboard } from "@/components/repos/dashboard";
import { RepoListSkeleton } from "@/components/repos/repo-list-skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Search + Reload — above header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1">
            <SearchBar />
          </div>
          <ReloadButton />
        </div>

        <Suspense fallback={<RepoListSkeleton count={10} />}>
          <Dashboard />
        </Suspense>
      </div>
    </TooltipProvider>
  );
}
