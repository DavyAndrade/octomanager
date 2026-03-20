"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateRepo } from "@/hooks/use-repo-mutations";
import { useUIStore } from "@/store/ui-store";
import { updateRepoSchema, type UpdateRepoInput } from "@/schemas/repo";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Repository } from "@/types/github";

interface EditRepoModalProps {
  repos: Repository[];
}

export function EditRepoModal({ repos }: EditRepoModalProps) {
  const { editTargetId, closeEditModal } = useUIStore();
  const { mutate: updateRepo, isPending } = useUpdateRepo();

  const repo = useMemo(
    () => (editTargetId ? repos.find((r) => r.id === editTargetId) : null),
    [editTargetId, repos],
  );

  const isOpen = !!repo;

  const form = useForm<UpdateRepoInput>({
    resolver: zodResolver(updateRepoSchema),
    defaultValues: {
      name: repo?.name ?? "",
      description: repo?.description ?? "",
      homepage: repo?.homepage ?? "",
      topics: repo?.topics ?? [],
    },
  });

  // Reset form when modal opens with fresh data
  useEffect(() => {
    if (isOpen && repo) {
      form.reset({
        name: repo.name,
        description: repo.description ?? "",
        homepage: repo.homepage ?? "",
        topics: repo.topics ?? [],
      });
    }
  }, [isOpen, repo, form]);

  const onSubmit = (data: UpdateRepoInput) => {
    if (!repo) return;
    // Only send changed fields
    const payload: UpdateRepoInput = {};
    if (data.name !== repo.name) payload.name = data.name;
    if ((data.description ?? "") !== (repo.description ?? ""))
      payload.description = data.description || null;
    if ((data.homepage ?? "") !== (repo.homepage ?? ""))
      payload.homepage = data.homepage || null;

    // Topics: compare as sorted arrays
    const newTopics = data.topics ?? [];
    const oldTopics = repo.topics ?? [];
    if (
      JSON.stringify([...newTopics].sort()) !==
      JSON.stringify([...oldTopics].sort())
    ) {
      payload.topics = newTopics;
    }

    if (Object.keys(payload).length === 0) {
      closeEditModal();
      return;
    }

    updateRepo(
      { owner: repo.owner.login, repo: repo.name, repoId: repo.id, payload },
      { onSuccess: closeEditModal },
    );
  };

  if (!repo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeEditModal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit repository</DialogTitle>
          <DialogDescription>
            Update the settings for{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {repo.full_name}
            </code>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="A short description of this repository"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="homepage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="https://example.com"
                      type="url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topics</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value?.join(", ") ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const topics = raw
                          .split(",")
                          .map((t) => t.trim().toLowerCase())
                          .filter(Boolean);
                        field.onChange(topics);
                      }}
                      placeholder="react, typescript, nextjs"
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated. Lowercase letters, numbers, and hyphens only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeEditModal}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
