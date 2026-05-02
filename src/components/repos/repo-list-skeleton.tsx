"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PAGE_SIZE = 10;

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell className="w-10 pr-0">
        <Skeleton className="h-4 w-4" />
      </TableCell>
      <TableCell className="min-w-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
      </TableCell>
      <TableCell className="w-[150px] whitespace-nowrap">
        <Skeleton className="h-5 w-16 rounded-md" />
      </TableCell>
      <TableCell className="w-[110px]">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="w-20 whitespace-nowrap">
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell className="w-[110px] whitespace-nowrap">
        <Skeleton className="h-3 w-16" />
      </TableCell>
      <TableCell className="w-20 whitespace-nowrap">
        <div className="flex justify-end gap-1">
          <Skeleton className="h-7 w-7 rounded-md" />
          <Skeleton className="h-7 w-7 rounded-md" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function RepoListSkeleton({ count = PAGE_SIZE }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pr-0" />
              <TableHead className="min-w-0">Repository</TableHead>
              <TableHead className="w-[150px] whitespace-nowrap">
                Visibility
              </TableHead>
              <TableHead className="w-[110px]">Language</TableHead>
              <TableHead className="w-20 whitespace-nowrap">Stars</TableHead>
              <TableHead className="w-[110px] whitespace-nowrap">Updated</TableHead>
              <TableHead className="w-20 whitespace-nowrap" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: count }).map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
}