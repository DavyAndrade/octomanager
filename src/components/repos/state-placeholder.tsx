"use client";

import { Inbox, SearchX, AlertCircle, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";

interface StatePlaceholderProps {
  type: "empty" | "filtered" | "error";
  message?: string;
  onAction?: () => void;
}

export function StatePlaceholder({
  type,
  message,
  onAction,
}: StatePlaceholderProps) {
  const openCreateModal = useUIStore((state) => state.openCreateModal);

  if (type === "empty") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/50">
          <Inbox className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          Your workbench is empty
        </h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          Create your first repository to start managing it from here.
        </p>
        <Button
          size="sm"
          className="cursor-pointer gap-1.5"
          onClick={openCreateModal}
        >
          <Plus className="h-4 w-4" />
          Create repository
        </Button>
      </div>
    );
  }

  if (type === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted/50">
          <SearchX className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-base font-semibold text-foreground">
          Nothing matches your filters
        </h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {message ?? "Try adjusting your search or filters to find what you're looking for."}
        </p>
        {onAction && (
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onAction}
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/30 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/5">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">
        Failed to load repositories
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {message ?? "Something went wrong while loading your repositories."}
      </p>
      {onAction && (
        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={onAction}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
