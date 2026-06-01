"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface KeyboardShortcutHintProps {
  shortcut: string;
  className?: string;
  noModifier?: boolean;
}

export function KeyboardShortcutHint({
  shortcut,
  className,
  noModifier = false,
}: KeyboardShortcutHintProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const checkMac = () => {
      setIsMac(
        typeof window !== "undefined" &&
          /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      );
    };
    checkMac();
  }, []);

  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
        className
      )}
    >
      {!noModifier && <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>}
      {shortcut}
    </kbd>
  );
}
