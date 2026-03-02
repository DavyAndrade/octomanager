"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevSignInButtonProps {
  className?: string;
}

export function DevSignInButton({ className }: DevSignInButtonProps) {
  return (
    <Button
      size="lg"
      variant="outline"
      className={className}
      onClick={() =>
        void signIn("dev-github", { callbackUrl: "/dashboard" })
      }
    >
      <Github className="mr-2 h-5 w-5" />
      Sign in (Dev Mode)
    </Button>
  );
}
