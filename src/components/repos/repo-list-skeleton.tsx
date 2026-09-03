"use client";

import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 12;

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="h-4 w-4 shrink-0 rounded" />
      <Skeleton className="h-6 w-6 shrink-0 rounded" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="hidden h-2 w-2 shrink-0 rounded-full sm:inline-block" />
      <Skeleton className="hidden h-3 w-12 shrink-0 sm:inline-block" />
      <Skeleton className="hidden h-3 w-16 shrink-0 md:inline-block" />
    </div>
  );
}

export function RepoListSkeleton({ count = PAGE_SIZE }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="divide-y divide-border rounded-md border border-border">
        {Array.from({ length: count }).map((_, i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}
