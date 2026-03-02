import { z } from "zod";

export const repoTopicSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9-]+$/, "Topics must be lowercase alphanumeric or hyphens");

export const updateRepoSchema = z.object({
  name: z
    .string()
    .min(1, "Repository name is required")
    .max(100, "Repository name must be 100 characters or less")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Name can only contain letters, numbers, hyphens, underscores, and dots"
    )
    .optional(),
  description: z
    .string()
    .max(350, "Description must be 350 characters or less")
    .nullable()
    .optional(),
  homepage: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  private: z.boolean().optional(),
  topics: z.array(repoTopicSchema).max(20, "Maximum 20 topics").optional(),
});

export const deleteRepoSchema = z.object({
  confirm: z.literal(true, {
    error: "You must confirm deletion",
  }),
});

export const repoListParamsSchema = z.object({
  type: z.enum(["all", "public", "private", "forks", "sources"]).optional(),
  sort: z.enum(["full_name", "created", "updated", "pushed"]).optional(),
  direction: z.enum(["asc", "desc"]).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
  search: z.string().optional(),
});

export type UpdateRepoInput = z.infer<typeof updateRepoSchema>;
export type DeleteRepoInput = z.infer<typeof deleteRepoSchema>;
export type RepoListParamsInput = z.infer<typeof repoListParamsSchema>;
