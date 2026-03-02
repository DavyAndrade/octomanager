export type RepoVisibility = "public" | "private";

export interface RepoOwner {
  login: string;
  avatar_url: string;
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  visibility: RepoVisibility;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  owner: RepoOwner;
  created_at: string;
  updated_at: string;
  pushed_at: string | null;
  default_branch: string;
  size: number;
  homepage: string | null;
}

export interface RepoUpdatePayload {
  name?: string;
  description?: string | null;
  homepage?: string | null;
  private?: boolean;
  topics?: string[];
  archived?: boolean;
}

export type RepoSortField =
  | "full_name"
  | "created"
  | "updated"
  | "pushed";

export type RepoTypeFilter =
  | "all"
  | "owner"
  | "public"
  | "private"
  | "forks"
  | "sources";

export interface RepoListParams {
  type?: RepoTypeFilter;
  sort?: RepoSortField;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
  search?: string;
}
