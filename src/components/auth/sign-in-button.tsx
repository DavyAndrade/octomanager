"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SignInButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function SignInButton({ className, size = "lg" }: SignInButtonProps) {
  return (
    <Button
      size={size}
      className={className}
      onClick={() => void signIn("github", { callbackUrl: "/dashboard" })}
    >
      <Github className="mr-2 h-5 w-5" />
      Continue with GitHub
    </Button>
  );
}
