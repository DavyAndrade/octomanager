"use client";

import { memo, useEffect, useState } from "react";
import { Trash2, Lock, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeyboardShortcutHint } from "@/components/ui/keyboard-shortcut-hint";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useBulkToggleVisibility } from "@/hooks/use-repo-mutations";
import { useUIStore } from "@/store/ui-store";
import { useShallow } from "zustand/react/shallow";
import type { Repository } from "@/types/github";

interface BulkActionBarProps {
  selectedRepos: Repository[];
}

type PendingBulk = {
  makePrivate: boolean;
  starred: Repository[];
  totalStars: number;
} | null;

export const BulkActionBar = memo(function BulkActionBar({
  selectedRepos,
}: BulkActionBarProps) {
  const { clearSelection, openBulkDelete } = useUIStore(
    useShallow((state) => ({
      clearSelection: state.clearSelection,
      openBulkDelete: state.openBulkDelete,
    }))
  );
  const { mutate: bulkToggle, isPending } = useBulkToggleVisibility();
  const count = selectedRepos.length;
  const [pending, setPending] = useState<PendingBulk>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && count > 0) {
        const activeElement = document.activeElement;
        const isInput =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement;

        if (!isInput) {
          clearSelection();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [count, clearSelection]);

  const handleToggleVisibility = (makePrivate: boolean) => {
    const starred = selectedRepos.filter((r) => r.stargazers_count > 0);
    if (starred.length > 0) {
      const totalStars = starred.reduce((s, r) => s + r.stargazers_count, 0);
      setPending({ makePrivate, starred, totalStars });
      return;
    }
    runBulkToggle(makePrivate);
  };

  const runBulkToggle = (makePrivate: boolean) => {
    const targets = selectedRepos.map((r) => ({
      owner: r.owner.login,
      repo: r.name,
      repoId: r.id,
    }));
    bulkToggle(
      { repos: targets, makePrivate },
      { onSuccess: clearSelection }
    );
  };

  const confirmStarReset = () => {
    if (pending) {
      runBulkToggle(pending.makePrivate);
    }
    setPending(null);
  };

  if (count === 0) return null;

  return (
    <div
      className="mb-2 flex items-center gap-1 rounded-md border border-foreground/20 bg-foreground/[0.03] px-1.5 py-1 dark:bg-foreground/[0.06]"
      role="region"
      aria-live="polite"
      aria-label={`${count} ${count === 1 ? "repository" : "repositories"} selected`}
    >
      <span className="flex items-center gap-1.5 px-1.5 text-sm font-medium tabular-nums">
        {count}
        <span className="text-muted-foreground">
          {count === 1 ? "selected" : "selected"}
        </span>
      </span>

      <span className="text-xs text-muted-foreground/60">·</span>

      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => handleToggleVisibility(false)}
        className="h-7 gap-1.5 px-2 text-xs"
      >
        <Globe className="h-3 w-3" />
        Public
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => handleToggleVisibility(true)}
        className="h-7 gap-1.5 px-2 text-xs"
      >
        <Lock className="h-3 w-3" />
        Private
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={openBulkDelete}
        disabled={isPending}
        className="h-7 gap-1.5 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </Button>

      <div className="ml-auto flex items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={clearSelection}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear selection</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            Clear selection
            <KeyboardShortcutHint shortcut="Esc" noModifier />
          </TooltipContent>
        </Tooltip>
      </div>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
        title="Changing visibility will reset stars"
        description={
          pending
            ? (() => {
                const action = pending.makePrivate ? "private" : "public";
                const repoCount = pending.starred.length;
                const sample = pending.starred
                  .slice(0, 3)
                  .map((r) => `${r.name} (${r.stargazers_count.toLocaleString()})`)
                  .join(", ");
                const more =
                  pending.starred.length > 3
                    ? ` and ${pending.starred.length - 3} more`
                    : "";
                return `${repoCount === 1 ? "1 selected repo has" : `${repoCount} selected repos have`} stars (${pending.totalStars.toLocaleString()} total).\n\nChanging visibility to ${action} will reset the star count on GitHub. This cannot be undone.\n\nAffected: ${sample}${more}`;
              })()
            : ""
        }
        confirmLabel="Change visibility"
        onConfirm={confirmStarReset}
      />
    </div>
  );
});
