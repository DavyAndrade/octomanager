"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  dev?: boolean;
}

type Status = "idle" | "loading" | "error";

const SAFETY_TIMEOUT_MS = 8_000;

export function SignInButton({ className, size = "lg", dev }: SignInButtonProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  const handleClick = () => {
    if (status === "loading") return;
    setStatus("loading");
    setMessage(null);

    safetyTimer.current = setTimeout(() => {
      setStatus("error");
      setMessage(
        "Sign-in is taking longer than expected. Check your connection and try again.",
      );
    }, SAFETY_TIMEOUT_MS);

    signIn(dev ? "dev-github" : "github", { callbackUrl: "/dashboard" }).catch(
      (err: unknown) => {
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        setStatus("error");
        setMessage(
          err instanceof Error && err.message
            ? `Couldn't start sign-in: ${err.message}`
            : "Couldn't reach GitHub. Check your connection and try again.",
        );
      },
    );
  };

  const retry = () => {
    setStatus("idle");
    setMessage(null);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="inline-flex items-center gap-2">
        <Button
          size={size}
          variant={dev ? "outline" : "default"}
          className={className}
          disabled={status === "loading"}
          aria-busy={status === "loading"}
          onClick={handleClick}
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : status === "error" ? (
            <AlertCircle aria-hidden />
          ) : (
            <Github aria-hidden />
          )}
          {status === "loading"
            ? "Connecting to GitHub…"
            : status === "error"
              ? "Try again"
              : dev
                ? "Sign in (Dev Mode)"
                : "Continue with GitHub"}
        </Button>
        {status === "error" && (
          <Button
            type="button"
            size={size}
            variant="ghost"
            onClick={retry}
            className="text-muted-foreground"
          >
            Reset
          </Button>
        )}
      </div>
      <p
        role="status"
        aria-live="polite"
        className="sr-only"
      >
        {status === "loading"
          ? "Connecting to GitHub."
          : status === "error"
            ? (message ?? "Sign-in failed.")
            : ""}
      </p>
      {status === "error" && message && (
        <p
          role="alert"
          className="max-w-xs text-sm text-destructive"
        >
          {message}
        </p>
      )}
    </div>
  );
}
