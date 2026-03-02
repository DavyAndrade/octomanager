import { QueryClient } from "@tanstack/react-query";

let queryClientSingleton: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (
            error instanceof Error &&
            "status" in error &&
            typeof (error as { status: unknown }).status === "number"
          ) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return makeQueryClient();
  }
  // Browser: reuse singleton
  queryClientSingleton ??= makeQueryClient();
  return queryClientSingleton;
}
