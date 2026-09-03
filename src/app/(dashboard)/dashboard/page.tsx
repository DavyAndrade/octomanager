import type { Metadata } from "next";
import { Suspense } from "react";
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
        <Suspense fallback={<RepoListSkeleton count={10} />}>
          <Dashboard />
        </Suspense>
      </div>
    </TooltipProvider>
  );
}
