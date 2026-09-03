"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import {
  Star,
  GitFork,
  Archive,
  Lock,
  Unlock,
  ExternalLink,
  Layers,
  User,
  Users,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/store/ui-store";
import { useShallow } from "zustand/react/shallow";
import { formatRepoCount, formatRelativeTime, LANGUAGE_COLORS } from "@/lib/utils";
import type { Repository } from "@/types/github";

interface RepoListProps {
  repos: Repository[];
  selectedIds: Set<number>;
  onToggleSelect: (id: number) => void;
  onEdit: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
  onToggleVisibility: (repo: Repository) => void;
  onReload: () => void;
  isReloading: boolean;
}

const PAGE_SIZE = 10;

export const RepoList = memo(function RepoList({
  repos,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleVisibility,
  onReload,
  isReloading,
}: RepoListProps) {
  const { activeSection, setActiveSection, searchQuery, setSearchQuery } = useUIStore(
    useShallow((state) => ({
      activeSection: state.activeSection,
      setActiveSection: state.setActiveSection,
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery,
    }))
  );

  // Section definitions — clean, no double-counting.
  // - "Your repos" = you own it (isOwner), not archived
  // - "Public" / "Private" = your owned repos filtered by visibility
  // - "Collabs" = you have access but don't own (member/collaborator)
  // - "Forks" = you forked something
  // - "Archived" = archived
  const sections = useMemo(() => {
    const owned = repos.filter((r) => r.isOwner === true && !r.archived);
    const collabs = repos.filter(
      (r) => r.isOwner === false && !r.archived,
    );
    const publicRepos = owned.filter((r) => !r.private);
    const privateRepos = owned.filter((r) => r.private);
    const forks = repos.filter((r) => r.fork && !r.archived);
    const archived = repos.filter((r) => r.archived);

    return {
      all: { label: "All", icon: Layers, count: repos.length, repos },
      owner: {
        label: "Your repos",
        icon: User,
        count: owned.length,
        repos: owned,
      },
      public: {
        label: "Public",
        icon: Unlock,
        count: publicRepos.length,
        repos: publicRepos,
      },
      private: {
        label: "Private",
        icon: Lock,
        count: privateRepos.length,
        repos: privateRepos,
      },
      collabs: {
        label: "Collabs",
        icon: Users,
        count: collabs.length,
        repos: collabs,
      },
      forks: {
        label: "Forks",
        icon: GitFork,
        count: forks.length,
        repos,
      },
      archived: {
        label: "Archived",
        icon: Archive,
        count: archived.length,
        repos: archived,
      },
    } as const;
  }, [repos]);

  const currentSection = sections[activeSection] ?? sections.owner;

  // Apply search
  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return currentSection.repos;
    const q = searchQuery.toLowerCase();
    return currentSection.repos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [currentSection.repos, searchQuery]);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredRepos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedRepos = filteredRepos.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Wrap onToggleVisibility to warn when changing visibility of a starred
  // repo. GitHub resets the stargazer count when a repo's visibility changes
  // (public ↔ private), which is destructive. The warning is per-row, not
  // bulk — bulk operations assume the user knows what they're doing.
  const handleToggleVisibility = (repo: Repository) => {
    if (repo.stargazers_count > 0) {
      const action = repo.private ? "make public" : "make private";
      const stars = repo.stargazers_count.toLocaleString();
      const ok = window.confirm(
        `${repo.name} has ${stars} ${repo.stargazers_count === 1 ? "star" : "stars"}.\n\n` +
          `Changing visibility to ${action === "make public" ? "public" : "private"} will reset the star count on GitHub.\n\n` +
          `Continue?`,
      );
      if (!ok) return;
    }
    onToggleVisibility(repo);
  };

  if (repos.length === 0) return null;

  const sidebarOrder: Array<keyof typeof sections> = [
    "all",
    "owner",
    "public",
    "private",
    "collabs",
    "forks",
    "archived",
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
      {/* Sidebar nav — sticky on desktop, horizontal scroll on mobile */}
      <nav className="space-y-3 md:sticky md:top-20 md:self-start">
        {/* Search + Reload at the top of the sidebar */}
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search…"
              className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-7 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
              aria-label="Search repositories"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onReload}
                disabled={isReloading}
                className="h-8 w-8 shrink-0 cursor-pointer"
                aria-label="Reload repositories"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isReloading ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reload</TooltipContent>
          </Tooltip>
        </div>

        {/* Section list */}
        <ul className="flex gap-1 overflow-x-auto md:flex-col md:gap-0.5 md:overflow-visible">
          {sidebarOrder.map((key) => {
            const section = sections[key];
            const Icon = section.icon;
            const isActive = activeSection === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSection(key);
                    setPage(1);
                  }}
                  className={`flex w-full shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{section.label}</span>
                  <span
                    className={`ml-auto text-xs tabular-nums ${
                      isActive
                        ? "text-background/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {section.count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main list area */}
      <div className="min-w-0 space-y-4">
        {pagedRepos.length === 0 ? (
          <div className="rounded-md border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No repositories match this filter.
          </div>
        ) : (
          <ul className="space-y-1">
            {pagedRepos.map((repo) => (
              <RepoRow
                key={repo.id}
                repo={repo}
                isSelected={selectedIds.has(repo.id)}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-end">
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                {getPageNumbers(currentPage, totalPages).map((p, i) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        isActive={p === currentPage}
                        onClick={() => setPage(p)}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage(Math.min(totalPages, currentPage + 1))
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
});

function getPageNumbers(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total];
  }
  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  }
  return [
    1,
    "ellipsis",
    current - 1,
    current,
    current + 1,
    "ellipsis",
    total,
  ];
}

interface RepoRowProps {
  repo: Repository;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (repo: Repository) => void;
  onDelete: (repo: Repository) => void;
  onToggleVisibility: (repo: Repository) => void;
}

const RepoRow = memo(function RepoRow({
  repo,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  onToggleVisibility,
}: RepoRowProps) {
  const langColor = repo.language
    ? (LANGUAGE_COLORS[repo.language] ?? "#71717a")
    : null;

  return (
    <li
      className={`group/row relative flex items-center gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors ${
        isSelected
          ? "border-foreground/20 bg-accent"
          : "hover:border-border hover:bg-accent/50"
      }`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelect(repo.id)}
        aria-label={`Select ${repo.name}`}
        className="shrink-0"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={repo.archived}
        onClick={() => onToggleVisibility(repo)}
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        aria-label={
          repo.private
            ? `Private — click to make ${repo.name} public`
            : `Public — click to make ${repo.name} private`
        }
      >
        {repo.private ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <Unlock className="h-3.5 w-3.5" />
        )}
      </Button>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Link
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-semibold text-foreground hover:underline"
          >
            {repo.name}
          </Link>
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100" />
        </div>
        {repo.description && (
          <p className="truncate text-xs text-muted-foreground">
            {repo.description}
          </p>
        )}
      </div>

      {langColor && (
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: langColor }}
          />
          <span className="truncate">{repo.language}</span>
        </div>
      )}

      {repo.stargazers_count > 0 && (
        <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground sm:inline">
          <Star className="mr-1 inline h-3 w-3" />
          {formatRepoCount(repo.stargazers_count)}
        </span>
      )}

      {repo.forks_count > 0 && (
        <span className="hidden w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground md:inline">
          <GitFork className="mr-1 inline h-3 w-3" />
          {formatRepoCount(repo.forks_count)}
        </span>
      )}

      <span className="hidden w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground lg:inline">
        {formatRelativeTime(repo.pushed_at ?? repo.updated_at)}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            aria-label={`Actions for ${repo.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="2" cy="7" r="1.5" />
              <circle cx="7" cy="7" r="1.5" />
              <circle cx="12" cy="7" r="1.5" />
            </svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() => onEdit(repo)}
            disabled={repo.archived}
            className="cursor-pointer"
          >
            Edit details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onToggleVisibility(repo)}
            disabled={repo.archived}
            className="cursor-pointer"
          >
            {repo.private ? "Make public" : "Make private"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(repo)}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            Delete repository
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
});
