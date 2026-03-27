import { z } from "zod";

export const repoTopicSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z0-9-]+$/, "Topics must be lowercase alphanumeric or hyphens");

export const ownerParamSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9-]+$/, "Invalid owner name");

export const repoParamSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[a-zA-Z0-9._-]+$/,
    "Name can only contain letters, numbers, hyphens, underscores, and dots"
  );

export const updateRepoSchema = z.object({
  name: repoParamSchema.optional(),
  description: z
    .string()
    .max(350, "Description must be 350 characters or less")
    .nullable()
    .optional(),
  homepage: z
    .string()
    .max(255, "URL must be 255 characters or less")
    .url("Must be a valid URL")
    .refine(
      (url) => url.startsWith("http://") || url.startsWith("https://"),
      "URL must use http or https"
    )
    .or(z.literal(""))
    .nullable()
    .optional(),
  private: z.boolean().optional(),
  topics: z.array(repoTopicSchema).max(20, "Maximum 20 topics").optional(),
});

export const deleteRepoSchema = z.object({
  name: repoParamSchema,
  confirm: z.literal(true, {
    error: "You must confirm deletion",
  }),
});

export const repoListParamsSchema = z.object({
  type: z.enum(["all", "owner", "public", "private", "forks", "sources"]).optional(),
  sort: z.enum(["full_name", "created", "updated", "pushed"]).optional(),
  direction: z.enum(["asc", "desc"]).optional(),
  per_page: z.coerce.number().min(1).max(100).optional(),
  page: z.coerce.number().min(1).optional(),
  search: z.string().optional(),
});

export type UpdateRepoInput = z.infer<typeof updateRepoSchema>;
export type DeleteRepoInput = z.infer<typeof deleteRepoSchema>;
export type RepoListParamsInput = z.infer<typeof repoListParamsSchema>;
