import { Inbox, SearchX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  isFiltered?: boolean;
  onReset?: () => void;
  onCreate?: () => void;
}

export function EmptyState({
  isFiltered = false,
  onReset,
  onCreate,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {isFiltered ? (
        <SearchX className="mb-4 h-10 w-10 text-muted-foreground" />
      ) : (
        <Inbox className="mb-4 h-10 w-10 text-muted-foreground" />
      )}
      <h3 className="mb-1 text-base font-semibold text-foreground">
        {isFiltered
          ? "No repositories match your filters"
          : "No repositories yet"}
      </h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {isFiltered
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Create your first repository to start managing your projects."}
      </p>
      {isFiltered && onReset && (
        <Button variant="outline" size="sm" onClick={onReset}>
          Clear filters
        </Button>
      )}
      {!isFiltered && onCreate && (
        <Button onClick={onCreate} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Create repository
        </Button>
      )}
    </div>
  );
}
