"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ReloadButton() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;

  const handleReload = () => {
    void queryClient.invalidateQueries({ queryKey: ["repos"] });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleReload}
          disabled={isFetching}
          className="h-9 w-9 shrink-0 cursor-pointer"
          aria-label="Reload repositories"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Reload repositories</TooltipContent>
    </Tooltip>
  );
}
