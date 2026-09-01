import { Inbox, SearchX, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatePlaceholderProps {
  type: "empty" | "filtered" | "error";
  message?: string;
  onAction?: () => void;
}

const config = {
  empty: {
    icon: Inbox,
    iconClass: "text-muted-foreground",
    title: "No repositories yet",
    description: "Create your first repository on GitHub and it will appear here.",
    actionLabel: undefined,
  },
  filtered: {
    icon: SearchX,
    iconClass: "text-muted-foreground",
    title: "No repositories match your filters",
    description:
      "Try adjusting your search or filters to find what you're looking for.",
    actionLabel: "Clear filters",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-destructive",
    title: "Failed to load repositories",
    description: "Something went wrong while loading your repositories.",
    actionLabel: "Try again",
  },
};

export function StatePlaceholder({
  type,
  message,
  onAction,
}: StatePlaceholderProps) {
  const { icon: Icon, iconClass, title, description, actionLabel } = config[type];
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className={`mb-4 h-10 w-10 ${iconClass}`} />
      <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        {message ?? description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {type === "error" && (
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
          )}
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
