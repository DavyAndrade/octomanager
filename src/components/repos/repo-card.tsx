"use client";

import Link from "next/link";
import {
  Star,
  GitFork,
  Circle,
  Lock,
  Globe,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VisibilityToggle } from "@/components/repos/visibility-toggle";
import { formatRepoCount, formatRelativeTime } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import type { Repository } from "@/types/github";

interface RepoCardProps {
  repo: Repository;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#FA7343",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Shell: "#89e051",
  Vue: "#41b883",
  Dart: "#00b4ab",
  Portugol: "#f8bd00",
  "Jupyter Notebook": "#DA5B0B",
  CMake: "#DA3434",
};

export function RepoCard({ repo }: RepoCardProps) {
  const { openEditModal, openDeleteModal } = useUIStore();

  const langColor = repo.language
    ? (LANGUAGE_COLORS[repo.language] ?? "#71717a")
    : null;

  return (
    <Card className="group flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-semibold text-foreground hover:underline"
              >
                {repo.name}
              </Link>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="mt-1 flex items-center gap-1.5">
              <Badge
                variant={repo.private ? "secondary" : "outline"}
                className="h-5 gap-1 px-1.5 text-[10px] font-medium"
              >
                {repo.private ? (
                  <Lock className="h-2.5 w-2.5" />
                ) : (
                  <Globe className="h-2.5 w-2.5" />
                )}
                {repo.private ? "Private" : "Public"}
              </Badge>

              {repo.fork && (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-medium text-muted-foreground"
                >
                  Fork
                </Badge>
              )}

              {repo.archived && (
                <Badge
                  variant="secondary"
                  className="h-5 px-1.5 text-[10px] font-medium"
                >
                  Archived
                </Badge>
              )}
            </div>
          </div>

          {/* Visibility Toggle */}
          {!repo.archived && (
            <VisibilityToggle
              repoId={repo.id}
              owner={repo.owner.login}
              repo={repo.name}
              isPrivate={repo.private}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {repo.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {repo.description}
          </p>
        )}

        {repo.topics && repo.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {repo.topics.slice(0, 5).map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className="h-4.5 px-1.5 text-[10px]"
              >
                {topic}
              </Badge>
            ))}
            {repo.topics.length > 5 && (
              <Badge
                variant="outline"
                className="h-4.5 px-1.5 text-[10px] text-muted-foreground"
              >
                +{repo.topics.length - 5}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {langColor && (
            <span className="flex items-center gap-1">
              <Circle
                className="h-3 w-3 fill-current"
                style={{ color: langColor }}
              />
              {repo.language}
            </span>
          )}

          {repo.stargazers_count > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-default items-center gap-0.5">
                  <Star className="h-3 w-3" />
                  {formatRepoCount(repo.stargazers_count)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {repo.stargazers_count.toLocaleString()} stars
              </TooltipContent>
            </Tooltip>
          )}

          {repo.forks_count > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-default items-center gap-0.5">
                  <GitFork className="h-3 w-3" />
                  {formatRepoCount(repo.forks_count)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {repo.forks_count.toLocaleString()} forks
              </TooltipContent>
            </Tooltip>
          )}

          <span title={new Date(repo.updated_at).toLocaleString()}>
            Updated {formatRelativeTime(repo.updated_at)}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => openEditModal(repo.id)}
                disabled={repo.archived}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit {repo.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit repository</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => openDeleteModal(repo.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete {repo.name}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete repository</TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
}
