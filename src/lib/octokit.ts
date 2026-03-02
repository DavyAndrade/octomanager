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
    if (status === 422) throw new Error(`Validation failed: ${message}`);
    throw new Error(`GitHub API error (${status}): ${message}`);
  }
  throw new Error("An unexpected error occurred");
}

export async function listRepos(
  token: string,
  params: RepoListParams = {}
): Promise<PaginatedResponse<Repository>> {
  const octokit = getOctokit(token);
  const {
    type = "all",
    sort = "updated",
    direction = "desc",
    per_page = 30,
    page = 1,
    search,
  } = params;

  try {
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      type,
      sort,
      direction,
      per_page,
      page,
    });

    let repos = response.data as unknown as Repository[];

    if (search) {
      const query = search.toLowerCase();
      repos = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query) ||
          repo.topics?.some((t) => t.toLowerCase().includes(query))
      );
    }

    const linkHeader = response.headers.link ?? "";
    const hasNextPage = linkHeader.includes('rel="next"');

    return {
      items: repos,
      total_count: repos.length,
      page,
      per_page,
      has_next_page: hasNextPage,
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

    const { data } = await octokit.rest.repos.update({
      owner,
      repo,
      ...repoPayload,
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
