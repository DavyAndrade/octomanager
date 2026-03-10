"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildRepoColumns } from "@/components/repos/repo-table-columns";
import { BulkActionBar } from "@/components/repos/bulk-action-bar";
import { BulkDeleteModal } from "@/components/repos/bulk-delete-modal";
import { DeleteRepoModal } from "@/components/repos/delete-repo-modal";
import { EditRepoModal } from "@/components/repos/edit-repo-modal";
import { useUIStore } from "@/store/ui-store";
import type { Repository } from "@/types/github";

const PAGE_SIZE = 10;

interface RepoTableProps {
  repos: Repository[];
}

export function RepoTable({ repos }: RepoTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const {
    openDeleteModal,
    openEditModal,
    deleteTargetId,
    editTargetId,
    selectedRepoIds,
    toggleSelected,
    selectAll,
    clearSelection,
  } = useUIStore();

  const columns = useMemo(
    () =>
      buildRepoColumns({
        onEdit: (repo) => openEditModal(repo.id),
        onDelete: (repo) => openDeleteModal(repo.id),
      }),
    [openEditModal, openDeleteModal],
  );

  const table = useReactTable({
    data: repos,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(next);

      // Sync TanStack selection into Zustand
      const selectedIds = Object.keys(next)
        .filter((k) => next[k])
        .map((k) => repos[parseInt(k, 10)]?.id)
        .filter((id): id is number => id !== undefined);

      if (Object.keys(next).every((k) => next[k])) {
        selectAll(repos.map((r) => r.id));
      } else if (Object.keys(next).length === 0) {
        clearSelection();
      } else {
        // Rebuild from the row indices
        selectedIds.forEach((id) => {
          if (!selectedRepoIds.has(id)) toggleSelected(id);
        });
        selectedRepoIds.forEach((id) => {
          if (!selectedIds.includes(id)) toggleSelected(id);
        });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  const deleteTarget =
    deleteTargetId !== null
      ? (repos.find((r) => r.id === deleteTargetId) ?? null)
      : null;

  const editTarget =
    editTargetId !== null
      ? (repos.find((r) => r.id === editTargetId) ?? null)
      : null;

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalPages = table.getPageCount();

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      <BulkActionBar selectedRepos={selectedRows} />

      {/* Table */}
      <div className="rounded-md border border-border">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | { className?: string }
                    | undefined;
                  return (
                    <TableHead key={header.id} className={meta?.className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="group"
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { className?: string }
                      | undefined;
                    return (
                      <TableCell key={cell.id} className={meta?.className}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No repositories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {table.getFilteredRowModel().rows.length} total ·{" "}
          {selectedRows.length > 0 && `${selectedRows.length} selected · `}
          page {pageIndex + 1} of {totalPages || 1}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer transition-colors hover:bg-accent disabled:opacity-40"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer transition-colors hover:bg-accent disabled:opacity-40"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      {deleteTarget && <DeleteRepoModal repo={deleteTarget} />}
      {editTarget && <EditRepoModal repo={editTarget} />}
      <BulkDeleteModal repos={repos} />
    </div>
  );
}
