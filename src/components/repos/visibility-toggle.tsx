"use client";

import { Switch } from "@/components/ui/switch";
import { useToggleVisibility } from "@/hooks/use-repo-mutations";
import { Lock, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VisibilityToggleProps {
  repoId: number;
  owner: string;
  repo: string;
  isPrivate: boolean;
}

export function VisibilityToggle({
  repoId,
  owner,
  repo,
  isPrivate,
}: VisibilityToggleProps) {
  const { mutate: toggleVisibility, isPending } = useToggleVisibility();

  const handleToggle = () => {
    toggleVisibility({ owner, repo, repoId, currentPrivate: isPrivate });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5">
          {isPrivate ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <Switch
            checked={!isPrivate}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label={`Toggle repository visibility (currently ${isPrivate ? "private" : "public"})`}
            className="data-[state=checked]:bg-zinc-700"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          Make {isPrivate ? "public" : "private"} — click to toggle visibility
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
