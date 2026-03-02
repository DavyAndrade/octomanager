"use client";

import { useUIStore } from "@/store/ui-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import type { RepoTypeFilter, RepoSortField } from "@/types/github";

const VISIBILITY_OPTIONS: { value: RepoTypeFilter; label: string }[] = [
  { value: "owner", label: "My repos" },
  { value: "all", label: "All (+ collabs)" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "forks", label: "Forks" },
  { value: "sources", label: "Sources" },
];

const SORT_OPTIONS: { value: RepoSortField; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest" },
  { value: "pushed", label: "Recently pushed" },
  { value: "full_name", label: "Name" },
];

export function FilterBar() {
  const {
    visibilityFilter,
    setVisibilityFilter,
    sortBy,
    setSortBy,
    resetFilters,
    searchQuery,
  } = useUIStore();

  const isFiltered =
    visibilityFilter !== "owner" || sortBy !== "updated" || searchQuery !== "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

      <Select
        value={visibilityFilter}
        onValueChange={(v) => setVisibilityFilter(v as RepoTypeFilter)}
      >
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          {VISIBILITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(v) => setSortBy(v as RepoSortField)}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-9 text-muted-foreground"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
