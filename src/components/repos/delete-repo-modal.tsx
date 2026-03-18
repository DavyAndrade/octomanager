"use client";

import { useMemo, useState } from "react";
import { useDeleteRepo } from "@/hooks/use-repo-mutations";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import type { Repository } from "@/types/github";

interface DeleteRepoModalProps {
  repos: Repository[];
}

export function DeleteRepoModal({ repos }: DeleteRepoModalProps) {
  const { deleteTargetId, closeDeleteModal } = useUIStore();
  const { mutate: deleteRepo, isPending } = useDeleteRepo();
  const [confirmName, setConfirmName] = useState("");

  const repo = useMemo(
    () => (deleteTargetId ? repos.find((r) => r.id === deleteTargetId) : null),
    [deleteTargetId, repos],
  );

  const isOpen = !!repo;
  const isConfirmed = confirmName === repo?.name;

  const handleDelete = () => {
    if (!isConfirmed || !repo) return;
    deleteRepo(
      { owner: repo.owner.login, repo: repo.name, repoId: repo.id },
      { onSuccess: closeDeleteModal },
    );
  };

  if (!repo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete repository</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            This action is <strong>permanent and irreversible</strong>. All
            code, issues, pull requests, and data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="confirm-name" className="text-sm">
            Type{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {repo.name}
            </code>{" "}
            to confirm:
          </Label>
          <Input
            id="confirm-name"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={repo.name}
            autoComplete="off"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={closeDeleteModal}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isPending}
          >
            {isPending ? "Deleting…" : "Delete repository"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
