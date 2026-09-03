"use client";

import { useSession } from "next-auth/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";

interface DashboardHeaderProps {
  totalCount: number | undefined;
  isLoading: boolean;
  visibleCount: number;
}

export function DashboardHeader({
  totalCount,
  isLoading,
  visibleCount,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const openCreateModal = useUIStore((state) => state.openCreateModal);

  const greeting = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {greeting === "there" ? "Dashboard" : `Hi, ${greeting}`}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Repositories
        </h1>
        {!isLoading && totalCount !== undefined && (
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount === 0
              ? "No repositories yet"
              : totalCount === 1
                ? "1 repository"
                : `${totalCount} ${totalCount === 1 ? "repository" : "repositories"}`}
            {visibleCount > 0 && visibleCount < totalCount && (
              <span className="text-muted-foreground/60">
                {" · "}
                {visibleCount} shown
              </span>
            )}
          </p>
        )}
      </div>

      <Button
        size="sm"
        className="cursor-pointer gap-1.5"
        onClick={openCreateModal}
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New repository</span>
        <span className="sm:hidden">New</span>
      </Button>
    </div>
  );
}
