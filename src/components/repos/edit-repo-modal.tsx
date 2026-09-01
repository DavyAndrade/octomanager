"use client";

import { memo, useEffect } from "react";
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
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { Repository } from "@/types/github";
import { RepoFormFields } from "./repo-form-fields";

interface EditRepoModalProps {
  repo: Repository | null;
}

export const EditRepoModal = memo(function EditRepoModal({
  repo,
}: EditRepoModalProps) {
  const closeEditModal = useUIStore((state) => state.closeEditModal);
  const { mutate: updateRepo, isPending } = useUpdateRepo();

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
    const payload: UpdateRepoInput = {};
    if (data.name !== repo.name) payload.name = data.name;
    if ((data.description ?? "") !== (repo.description ?? ""))
      payload.description = data.description || null;
    if ((data.homepage ?? "") !== (repo.homepage ?? ""))
      payload.homepage = data.homepage || null;

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
            <RepoFormFields control={form.control} />

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
});
