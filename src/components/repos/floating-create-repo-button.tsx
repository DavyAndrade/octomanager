"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/store/ui-store";
import { useShallow } from "zustand/react/shallow";

export function FloatingCreateRepoButton() {
  const { openCreateModal } = useUIStore(
    useShallow((state) => ({
      openCreateModal: state.openCreateModal,
    }))
  );

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
              onClick={openCreateModal}
              aria-label="Create new repository"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Create repository</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
