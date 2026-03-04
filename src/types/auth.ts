import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      login?: string;
    };
  }
}

export interface AuthSession {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    login: string;
  };
  expires: string;
}
