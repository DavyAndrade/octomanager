"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VisibilityToggle } from "@/components/repos/visibility-toggle";
import { formatRepoCount, formatRelativeTime } from "@/lib/utils";
import type { Repository } from "@/types/github";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#FA7343",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Vue: "#41b883",
  Dart: "#00b4ab",
  Portugol: "#f8bd00",
  "Jupyter Notebook": "#DA5B0B",
  CMake: "#DA3434",
};

interface ActionHandlers {
  onEdit: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
}

export function buildRepoColumns(
  handlers: ActionHandlers,
): ColumnDef<Repository>[] {
  return [
    // ── Select ────────────────────────────────────────────────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${row.original.name}`}
          className="translate-y-0.5 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
      meta: { className: "w-10 pr-0" },
    },

    // ── Name ──────────────────────────────────────────────────────────────────
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Repository
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => {
        const repo = row.original;
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-1.5">
              <Link
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-medium text-foreground hover:underline"
              >
                {repo.name}
              </Link>
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-60" />
              {repo.fork && (
                <Badge
                  variant="outline"
                  className="h-4 shrink-0 px-1 text-[10px] text-muted-foreground"
                >
                  Fork
                </Badge>
              )}
              {repo.archived && (
                <Badge
                  variant="secondary"
                  className="h-4 shrink-0 px-1 text-[10px]"
                >
                  Archived
                </Badge>
              )}
            </div>
            {repo.description && (
              <p className="truncate text-xs text-muted-foreground">
                {repo.description}
              </p>
            )}
          </div>
        );
      },
      // Takes up remaining space — no explicit size so table can flex it
      meta: { className: "min-w-0" },
    },

    // ── Visibility ────────────────────────────────────────────────────────────
    {
      accessorKey: "private",
      header: "Visibility",
      cell: ({ row }) => {
        const repo = row.original;
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={repo.private ? "secondary" : "outline"}
              className="h-5 w-16 shrink-0 justify-center gap-1 text-[11px] font-medium"
            >
              {repo.private ? "Private" : "Public"}
            </Badge>
            {!repo.archived && (
              <VisibilityToggle
                repoId={repo.id}
                owner={repo.owner.login}
                repo={repo.name}
                isPrivate={repo.private}
              />
            )}
          </div>
        );
      },
      filterFn: (row, _id, value: string) => {
        if (value === "all") return true;
        if (value === "private") return row.original.private;
        if (value === "public") return !row.original.private;
        return true;
      },
      size: 150,
      meta: { className: "w-[150px] whitespace-nowrap" },
    },

    // ── Language ──────────────────────────────────────────────────────────────
    {
      accessorKey: "language",
      header: "Language",
      cell: ({ row }) => {
        const lang = row.original.language;
        if (!lang)
          return <span className="text-xs text-muted-foreground">—</span>;
        const color = LANGUAGE_COLORS[lang] ?? "#71717a";
        return (
          <span className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="truncate">{lang}</span>
          </span>
        );
      },
      size: 110,
      meta: { className: "w-[110px]" },
    },

    // ── Stars ─────────────────────────────────────────────────────────────────
    {
      accessorKey: "stargazers_count",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stars
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {formatRepoCount(row.original.stargazers_count)}
        </span>
      ),
      size: 80,
      meta: { className: "w-20 whitespace-nowrap" },
    },

    // ── Updated ───────────────────────────────────────────────────────────────
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      ),
      cell: ({ row }) => (
        <span
          className="text-xs text-muted-foreground"
          title={new Date(row.original.updated_at).toLocaleString()}
        >
          {formatRelativeTime(row.original.updated_at)}
        </span>
      ),
      size: 110,
      meta: { className: "w-[110px] whitespace-nowrap" },
    },

    // ── Actions ───────────────────────────────────────────────────────────────
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const repo = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 cursor-pointer"
                  onClick={() => handlers.onEdit(repo)}
                  disabled={repo.archived}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit {repo.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  onClick={() => handlers.onDelete(repo)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete {repo.name}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        );
      },
      size: 80,
      meta: { className: "w-20 whitespace-nowrap" },
    },
  ];
}
