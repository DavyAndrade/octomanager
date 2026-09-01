"use client";

import { memo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRepo } from "@/hooks/use-repo-mutations";
import { useUIStore } from "@/store/ui-store";
import { useShallow } from "zustand/react/shallow";
import { createRepoSchema, type CreateRepoInput } from "@/schemas/repo";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RepoFormFields } from "./repo-form-fields";

export const CreateRepoModal = memo(function CreateRepoModal() {
  const { createTargetId, closeCreateModal } = useUIStore(
    useShallow((state) => ({
      createTargetId: state.createTargetId,
      closeCreateModal: state.closeCreateModal,
    })),
  );
  const { mutate: createRepo, isPending } = useCreateRepo();

  const isOpen = createTargetId !== null;

  const form = useForm<CreateRepoInput>({
    resolver: zodResolver(createRepoSchema),
    defaultValues: {
      name: "",
      description: "",
      homepage: "",
      topics: [],
      private: false,
      auto_init: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: "",
        description: "",
        homepage: "",
        topics: [],
        private: false,
        auto_init: false,
      });
    }
  }, [isOpen, form]);

  const onSubmit = (data: CreateRepoInput) => {
    createRepo(data, { onSuccess: closeCreateModal });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeCreateModal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new repository</DialogTitle>
          <DialogDescription>
            Create a new repository in your GitHub account
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <RepoFormFields control={form.control} />

            <FormField
              control={form.control}
              name="private"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Repository visibility</FormLabel>
                      <FormDescription>
                        {field.value ? "Private" : "Public"}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="auto_init"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Initialize with a README</FormLabel>
                      <FormDescription>
                        Creates an initial commit with a README file
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked === true);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={closeCreateModal}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating…" : "Create repository"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});
