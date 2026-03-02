"use client";

import { useBulkDeleteRepos } from "@/hooks/use-repo-mutations";
import { useUIStore } from "@/store/ui-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import type { Repository } from "@/types/github";

interface BulkDeleteModalProps {
  repos: Repository[];
}

export function BulkDeleteModal({ repos }: BulkDeleteModalProps) {
  const { bulkDeleteOpen, closeBulkDelete, selectedRepoIds, clearSelection } =
    useUIStore();
  const { mutate: bulkDelete, isPending } = useBulkDeleteRepos();

  const targets = repos.filter((r) => selectedRepoIds.has(r.id));

  const handleConfirm = () => {
    bulkDelete(
      targets.map((r) => ({ owner: r.owner.login, repo: r.name, repoId: r.id })),
      {
        onSuccess: () => {
          clearSelection();
          closeBulkDelete();
        },
      }
    );
  };

  return (
    <Dialog open={bulkDeleteOpen} onOpenChange={(open) => !open && closeBulkDelete()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>
              Delete {targets.length} {targets.length === 1 ? "repository" : "repositories"}?
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            This action is <strong>permanent and irreversible</strong>. The following
            repositories and all their data will be permanently deleted:
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-48 overflow-y-auto rounded-md border border-border bg-muted/50 py-2 text-sm">
          {targets.map((r) => (
            <li key={r.id} className="flex items-center gap-2 px-3 py-1">
              <span className="font-mono text-xs text-muted-foreground">
                {r.owner.login}/
              </span>
              <span className="font-medium">{r.name}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={closeBulkDelete} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || targets.length === 0}
          >
            {isPending
              ? "Deleting…"
              : `Delete ${targets.length} ${targets.length === 1 ? "repository" : "repositories"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
