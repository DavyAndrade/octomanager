"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  dev?: boolean;
}

export function SignInButton({ className, size = "lg", dev }: SignInButtonProps) {
  return (
    <Button
      size={size}
      variant={dev ? "outline" : "default"}
      className={className}
      onClick={() =>
        void signIn(dev ? "dev-github" : "github", { callbackUrl: "/dashboard" })
      }
    >
      <Github className="mr-2 h-5 w-5" />
      {dev ? "Sign in (Dev Mode)" : "Continue with GitHub"}
    </Button>
  );
}
