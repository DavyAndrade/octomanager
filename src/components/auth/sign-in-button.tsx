"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Github, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  dev?: boolean;
}

export function SignInButton({ className, size = "lg", dev }: SignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    void signIn(dev ? "dev-github" : "github", { callbackUrl: "/dashboard" });
  };

  return (
    <Button
      size={size}
      variant={dev ? "outline" : "default"}
      className={className}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Github className="mr-2 h-5 w-5" />
      )}
      {loading
        ? "Connecting to GitHub…"
        : dev
          ? "Sign in (Dev Mode)"
          : "Continue with GitHub"}
    </Button>
  );
}
