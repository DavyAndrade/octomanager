import "server-only";
import { Octokit } from "octokit";
import type {
  Repository,
  RepoUpdatePayload,
  RepoListParams,
} from "@/types/github";
import type { PaginatedResponse } from "@/types/api";

export function getOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

function handleGitHubError(error: unknown): never {
  if (
    error instanceof Error &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  ) {
    const status = (error as { status: number }).status;
    const message = (error as { message: string }).message;

    if (status === 401) throw new Error("GitHub token is invalid or expired");
    if (status === 403) {
      if (message.includes("rate limit")) {
        throw new Error("GitHub API rate limit exceeded. Try again later.");
      }
      throw new Error("Forbidden: insufficient GitHub permissions");
    }
    if (status === 404) throw new Error("Repository not found");
    if (status === 422) throw new Error("Validation failed: Please check your input");
    throw new Error(`GitHub API error (${status})`);
  }
  throw new Error("An unexpected error occurred");
}

export async function listRepos(
  token: string,
  params: RepoListParams = {}
): Promise<PaginatedResponse<Repository>> {
  const octokit = getOctokit(token);
  const {
    type = "owner",
    sort = "pushed",
    direction = "desc",
    per_page = 30,
    page = 1,
    search,
  } = params;

  // GitHub API only accepts these values for listForAuthenticatedUser.
  // "forks" and "sources" are handled via client-side post-filtering.
  type ApiType = "all" | "owner" | "public" | "private" | "member";
  const apiType: ApiType =
    type === "forks" || type === "sources" ? "all" : (type as ApiType);

  try {
    // Paginate through ALL GitHub pages so total_count reflects the real count,
    // not just the first 100 results. The table paginates locally.
    // Optimization: Map results to include only necessary fields, reducing payload size.
    const allRepos = await octokit.paginate(
      octokit.rest.repos.listForAuthenticatedUser,
      { type: apiType, sort, direction, per_page: 100 },
      (response) =>
        response.data.map(
          (repo): Repository => ({
            id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            private: repo.private,
            visibility: (repo.visibility as "public" | "private") ?? (repo.private ? "private" : "public"),
            html_url: repo.html_url,
            clone_url: repo.clone_url,
            ssh_url: repo.ssh_url,
            fork: repo.fork,
            archived: repo.archived ?? false,
            disabled: repo.disabled ?? false,
            stargazers_count: repo.stargazers_count ?? 0,
            watchers_count: repo.watchers_count ?? 0,
            forks_count: repo.forks_count ?? 0,
            open_issues_count: repo.open_issues_count ?? 0,
            language: repo.language ?? null,
            topics: repo.topics ?? [],
            owner: {
              login: repo.owner.login,
              avatar_url: repo.owner.avatar_url,
              html_url: repo.owner.html_url,
            },
            created_at: repo.created_at ?? "",
            updated_at: repo.updated_at ?? "",
            pushed_at: repo.pushed_at ?? null,
            default_branch: repo.default_branch,
            size: repo.size,
            homepage: repo.homepage ?? null,
          })
        )
    );

    let repos = allRepos;

    // Client-side post-filters for types the API does not natively support
    if (type === "forks") {
      repos = repos.filter((r) => r.fork);
    } else if (type === "sources") {
      repos = repos.filter((r) => !r.fork);
    }

    if (search) {
      const query = search.toLowerCase();
      repos = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query) ||
          repo.topics?.some((t) => t.toLowerCase().includes(query))
      );
    }

    return {
      items: repos,
      total_count: repos.length,
      page,
      per_page,
      has_next_page: false, // all pages already fetched
    };
  } catch (error) {
    handleGitHubError(error);
  }
}

export async function updateRepo(
  token: string,
  owner: string,
  repo: string,
  payload: RepoUpdatePayload
): Promise<Repository> {
  const octokit = getOctokit(token);

  try {
    // Update topics separately if provided (different API endpoint)
    if (payload.topics !== undefined) {
      await octokit.rest.repos.replaceAllTopics({
        owner,
        repo,
        names: payload.topics,
      });
    }

    const { topics: _topics, ...repoPayload } = payload;

    if (Object.keys(repoPayload).length === 0 && payload.topics !== undefined) {
      // Only topics were updated; fetch updated repo
      const { data } = await octokit.rest.repos.get({ owner, repo });
      return data as unknown as Repository;
    }

    // Octokit types don't accept null — convert to undefined to clear fields
    const sanitizedPayload = {
      ...repoPayload,
      description: repoPayload.description ?? undefined,
      homepage: repoPayload.homepage ?? undefined,
    };

    const { data } = await octokit.rest.repos.update({
      owner,
      repo,
      ...sanitizedPayload,
    });

    return data as unknown as Repository;
  } catch (error) {
    handleGitHubError(error);
  }
}

export async function deleteRepo(
  token: string,
  owner: string,
  repo: string
): Promise<void> {
  const octokit = getOctokit(token);

  try {
    await octokit.rest.repos.delete({ owner, repo });
  } catch (error) {
    handleGitHubError(error);
  }
}
