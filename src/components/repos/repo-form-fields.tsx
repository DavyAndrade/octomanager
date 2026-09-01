import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Control, FieldValues, Path } from "react-hook-form";

interface RepoFormFieldsProps<T extends FieldValues> {
  control: Control<T>;
  namePrefix?: Path<T>;
}

export function RepoFormFields<T extends FieldValues>({
  control,
  namePrefix = "" as Path<T>,
}: RepoFormFieldsProps<T>) {
  const p = (field: string) => (namePrefix ? `${namePrefix}.${field}` : field) as Path<T>;

  return (
    <>
      <FormField
        control={control}
        name={p("name")}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Repository name</FormLabel>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {field.value?.length ?? 0}/100
              </span>
            </div>
            <FormControl>
              <Input {...field} maxLength={100} autoFocus />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={p("description")}
        render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Description</FormLabel>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {(field.value ?? "").length}/350
              </span>
            </div>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? ""}
                placeholder="A short description of this repository"
                rows={3}
                maxLength={350}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={p("homepage")}
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
        control={control}
        name={p("topics")}
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
    </>
  );
}
