"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Lock, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useBulkToggleVisibility } from "@/hooks/use-repo-mutations";
import { useUIStore } from "@/store/ui-store";
import type { Repository } from "@/types/github";

interface BulkActionBarProps {
  selectedRepos: Repository[];
}

export function BulkActionBar({ selectedRepos }: BulkActionBarProps) {
  const { clearSelection, openBulkDelete } = useUIStore();
  const { mutate: bulkToggle, isPending } = useBulkToggleVisibility();
  const count = selectedRepos.length;

  const handleToggleVisibility = (makePrivate: boolean) => {
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

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-sm"
        >
          <span className="text-sm font-medium text-foreground">
            {count} {count === 1 ? "repository" : "repositories"} selected
          </span>

          <Separator orientation="vertical" className="h-5" />

          {/* Visibility bulk action */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isPending}>
                Change visibility
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Set selected repos to…</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggleVisibility(false)}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                Make public
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleVisibility(true)}
                className="flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Make private
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bulk delete */}
          <Button
            variant="destructive"
            size="sm"
            onClick={openBulkDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete selected
          </Button>

          {/* Clear selection */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7 text-muted-foreground"
            onClick={clearSelection}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
