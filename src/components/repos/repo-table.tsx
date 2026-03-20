"use client";

import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
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

  const { openDeleteModal, openEditModal, selectedRepoIds, setSelectedRepoIds } =
    useUIStore(
      useShallow((state) => ({
        openDeleteModal: state.openDeleteModal,
        openEditModal: state.openEditModal,
        selectedRepoIds: state.selectedRepoIds,
        setSelectedRepoIds: state.setSelectedRepoIds,
      })),
    );

  // Optimization: Derive TanStack selection state from Zustand O(N) where N is number of selected items.
  // This avoids maintaining duplicate state and keeps the Zustand store as the single source of truth.
  const rowSelection = useMemo(() => {
    const selection: RowSelectionState = {};
    selectedRepoIds.forEach((id) => {
      selection[id.toString()] = true;
    });
    return selection;
  }, [selectedRepoIds]);

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
    getRowId: (row) => row.id.toString(),
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(rowSelection) : updater;

      // Optimization: Sync TanStack selection into Zustand in O(N) where N is number of selected items.
      // This batch update prevents O(N^2) update loops and excessive re-renders.
      const selectedIds = new Set<number>();
      for (const id in next) {
        if (next[id]) {
          selectedIds.add(parseInt(id, 10));
        }
      }
      setSelectedRepoIds(selectedIds);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);

  const { pageIndex } = table.getState().pagination;
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
            className="h-8 w-8 cursor-pointer transition-colors enabled:hover:bg-accent disabled:opacity-40"
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
            className="h-8 w-8 cursor-pointer transition-colors enabled:hover:bg-accent disabled:opacity-40"
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
      <DeleteRepoModal repos={repos} />
      <EditRepoModal repos={repos} />
      <BulkDeleteModal repos={repos} />
    </div>
  );
}
