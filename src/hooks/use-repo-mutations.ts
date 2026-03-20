"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { repoKeys } from "@/hooks/use-repos";
import type { Repository } from "@/types/github";
import type { UpdateRepoInput } from "@/schemas/repo";
import type { PaginatedResponse } from "@/types/api";

// ─── Helpers ────────────────────────────────────────────────────────────────

function updateRepoInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  repoId: number,
  updater: (repo: Repository) => Repository
) {
  queryClient.setQueriesData<PaginatedResponse<Repository>>(
    { queryKey: repoKeys.all },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map((r) => (r.id === repoId ? updater(r) : r)),
      };
    }
  );
}

async function patchRepo(
  owner: string,
  repo: string,
  payload: UpdateRepoInput
): Promise<Repository> {
  const res = await fetch(`/api/repos/${owner}/${repo}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(errorData.error ?? "Failed to update repository");
  }

  const json = (await res.json()) as { data: Repository };
  return json.data;
}

async function destroyRepo(owner: string, repo: string): Promise<void> {
  const res = await fetch(`/api/repos/${owner}/${repo}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: repo, confirm: true }),
  });

  if (!res.ok && res.status !== 204) {
    const errorData = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(errorData.error ?? "Failed to delete repository");
  }
}

// ─── Toggle Visibility ──────────────────────────────────────────────────────

export function useToggleVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      owner,
      repo,
      currentPrivate,
    }: {
      owner: string;
      repo: string;
      repoId: number;
      currentPrivate: boolean;
    }) => patchRepo(owner, repo, { private: !currentPrivate }),

    onMutate: async ({ repoId, currentPrivate }) => {
      await queryClient.cancelQueries({ queryKey: repoKeys.all });

      const previousData = queryClient.getQueriesData<
        PaginatedResponse<Repository>
      >({ queryKey: repoKeys.all });

      updateRepoInCache(queryClient, repoId, (r) => ({
        ...r,
        private: !currentPrivate,
        visibility: currentPrivate ? "public" : "private",
      }));

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to toggle visibility");
    },

    onSuccess: (_data, { currentPrivate }) => {
      toast.success(
        `Repository is now ${currentPrivate ? "public" : "private"}`
      );
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: repoKeys.all });
    },
  });
}

// ─── Update Repo ─────────────────────────────────────────────────────────────

export function useUpdateRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      owner,
      repo,
      payload,
    }: {
      owner: string;
      repo: string;
      repoId: number;
      payload: UpdateRepoInput;
    }) => patchRepo(owner, repo, payload),

    onMutate: async ({ repoId, payload }) => {
      await queryClient.cancelQueries({ queryKey: repoKeys.all });

      const previousData = queryClient.getQueriesData<
        PaginatedResponse<Repository>
      >({ queryKey: repoKeys.all });

      updateRepoInCache(queryClient, repoId, (r) => ({
        ...r,
        ...(payload.name !== undefined && { name: payload.name }),
        ...(payload.description !== undefined && {
          description: payload.description,
        }),
        ...(payload.topics !== undefined && { topics: payload.topics }),
      }));

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to update repository");
    },

    onSuccess: () => {
      toast.success("Repository updated successfully");
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: repoKeys.all });
    },
  });
}

// ─── Delete Repo ─────────────────────────────────────────────────────────────

export function useDeleteRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      owner,
      repo,
    }: {
      owner: string;
      repo: string;
      repoId: number;
    }) => destroyRepo(owner, repo),

    onMutate: async ({ repoId }) => {
      await queryClient.cancelQueries({ queryKey: repoKeys.all });

      const previousData = queryClient.getQueriesData<
        PaginatedResponse<Repository>
      >({ queryKey: repoKeys.all });

      queryClient.setQueriesData<PaginatedResponse<Repository>>(
        { queryKey: repoKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((r) => r.id !== repoId),
            total_count: old.total_count - 1,
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Failed to delete repository");
    },

    onSuccess: (_data, { repo }) => {
      toast.success(`Repository "${repo}" deleted`);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: repoKeys.all });
    },
  });
}

// ─── Bulk Delete ─────────────────────────────────────────────────────────────

export function useBulkDeleteRepos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (repos: Array<{ owner: string; repo: string; repoId: number }>) => {
      const results = await Promise.allSettled(
        repos.map(({ owner, repo }) => destroyRepo(owner, repo))
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) throw new Error(`${failed} of ${repos.length} deletions failed`);
    },

    onMutate: async (repos) => {
      await queryClient.cancelQueries({ queryKey: repoKeys.all });
      const previousData = queryClient.getQueriesData<PaginatedResponse<Repository>>(
        { queryKey: repoKeys.all }
      );
      const ids = new Set(repos.map((r) => r.repoId));
      queryClient.setQueriesData<PaginatedResponse<Repository>>(
        { queryKey: repoKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.filter((r) => !ids.has(r.id)),
            total_count: old.total_count - ids.size,
          };
        }
      );
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Bulk delete failed — changes rolled back");
    },

    onSuccess: (_data, repos) => {
      toast.success(`${repos.length} ${repos.length === 1 ? "repository" : "repositories"} deleted`);
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: repoKeys.all });
    },
  });
}

// ─── Bulk Toggle Visibility ───────────────────────────────────────────────────

export function useBulkToggleVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      repos,
      makePrivate,
    }: {
      repos: Array<{ owner: string; repo: string; repoId: number }>;
      makePrivate: boolean;
    }) => {
      const results = await Promise.allSettled(
        repos.map(({ owner, repo }) =>
          patchRepo(owner, repo, { private: makePrivate })
        )
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) throw new Error(`${failed} of ${repos.length} updates failed`);
    },

    onMutate: async ({ repos, makePrivate }) => {
      await queryClient.cancelQueries({ queryKey: repoKeys.all });
      const previousData = queryClient.getQueriesData<PaginatedResponse<Repository>>(
        { queryKey: repoKeys.all }
      );
      const ids = new Set(repos.map((r) => r.repoId));
      queryClient.setQueriesData<PaginatedResponse<Repository>>(
        { queryKey: repoKeys.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            items: old.items.map((r) =>
              ids.has(r.id)
                ? { ...r, private: makePrivate, visibility: makePrivate ? "private" : "public" }
                : r
            ),
          };
        }
      );
      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [queryKey, data] of context.previousData) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error("Bulk visibility update failed — changes rolled back");
    },

    onSuccess: (_data, { repos, makePrivate }) => {
      toast.success(
        `${repos.length} ${repos.length === 1 ? "repository" : "repositories"} made ${makePrivate ? "private" : "public"}`
      );
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: repoKeys.all });
    },
  });
}
