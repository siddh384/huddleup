"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortDescriptor } from "react-aria-components";
import { RiArrowDownSLine } from "@remixicon/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";
import { Button } from "@/components/base/buttons/button";
import { CloseButton } from "@/components/base/buttons/close-button";
import { CheckboxGlyph } from "@/components/base/checkbox/checkbox-glyph";
import { Pagination } from "@/components/base/pagination/pagination";
import {
  ChevronSortDown,
  ChevronUpDownSmall,
} from "@/components/foundations/icons/chevrons";
import { cn } from "@/lib/utils";

// TanStack state (sorting/filtering/pagination/selection) rendered through
// BoardUI's React Aria table primitives. Sort clicks come from React Aria's
// native column sorting and are mapped onto TanStack's sorting state.
export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn = "name",
  filterPlaceholder = "Filter...",
  label = "Data table",
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  label?: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Row-selection toggle rendered as a plain button + BoardUI glyph. A React
// Aria Checkbox can't be used here: inside a RAC Table it must occupy the
// table's "selection" slot, which hands state ownership to the table. This
// keeps TanStack as the single source of selection truth.
function SelectionCheckbox({
  isSelected,
  isIndeterminate = false,
  onToggle,
  label,
}: {
  isSelected: boolean;
  isIndeterminate?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isIndeterminate ? "mixed" : isSelected}
      aria-label={label}
      onClick={onToggle}
      className="flex cursor-pointer items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2"
    >
      <CheckboxGlyph
        state={{
          isSelected,
          isIndeterminate,
          isFocusVisible: false,
          isDisabled: false,
          isHovered: false,
        }}
      />
    </button>
  );
}

// Leading row-selection column; closures reference `table` after creation.
  const selectionColumn: ColumnDef<TData, undefined> = {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: () => {
      const allSelected = table.getIsAllRowsSelected();
      return (
        <SelectionCheckbox
          isSelected={allSelected}
          isIndeterminate={table.getIsSomeRowsSelected() && !allSelected}
          onToggle={() => table.toggleAllRowsSelected(!allSelected)}
          label="Select all rows"
        />
      );
    },
    cell: ({ row }) => (
      <SelectionCheckbox
        isSelected={row.getIsSelected()}
        onToggle={() => row.toggleSelected()}
        label="Select row"
      />
    ),
  };

  const table = useReactTable({
    data,
    columns: [selectionColumn, ...columns],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const sortDescriptor: SortDescriptor | undefined = sorting[0]
    ? {
        column: sorting[0].id,
        direction: sorting[0].desc ? "descending" : "ascending",
      }
    : undefined;

  const handleSortChange = (descriptor: SortDescriptor) => {
    if (descriptor.direction === "ascending") {
      setSorting([{ id: String(descriptor.column), desc: false }]);
    } else if (descriptor.direction === "descending") {
      setSorting([{ id: String(descriptor.column), desc: true }]);
    } else {
      setSorting([]);
    }
  };

  const filterValue =
    (table.getColumn(filterColumn)?.getFilterValue() as string) ?? "";
  const hasFilter = filterValue.length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 pb-3">
        <div className="relative max-w-sm flex-1">
          <Input
            placeholder={filterPlaceholder}
            value={filterValue}
            onChange={(event) =>
              table
                .getColumn(filterColumn)
                ?.setFilterValue(event.target.value)
            }
            className="w-full pr-7"
          />
          {hasFilter && (
            <CloseButton
              size="2xs"
              aria-label="Clear filter"
              onClick={() => table.getColumn(filterColumn)?.setFilterValue("")}
              className="absolute top-1/2 right-2 -translate-y-1/2"
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="small"
              trailingIcon={RiArrowDownSLine}
              className="ml-auto"
            >
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table
        aria-label={label}
        sortDescriptor={sortDescriptor}
        onSortChange={handleSortChange}
      >
        <TableHeader>
          {table.getHeaderGroups()[0].headers.map((header) => {
            const sortable = header.column.getCanSort();
            const sorted = sorting.find((s) => s.id === header.column.id);
            return (
              <TableColumn
                key={header.id}
                id={header.column.id}
                isRowHeader={header.index === 0}
                allowsSorting={sortable}
              >
                <span className="inline-flex items-center gap-1">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                  {sortable &&
                    (sorted ? (
                      <ChevronSortDown
                        className={cn(
                          "size-3 transition-transform",
                          !sorted.desc && "rotate-180",
                        )}
                      />
                    ) : (
                      <ChevronUpDownSmall className="size-3 opacity-40" />
                    ))}
                </span>
              </TableColumn>
            );
          })}
        </TableHeader>
        <TableBody renderEmptyState={() => "No results."}>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Pagination
          page={table.getState().pagination.pageIndex + 1}
          totalPages={Math.max(1, table.getPageCount())}
          onChange={(page) => table.setPageIndex(page - 1)}
          className="w-auto"
        />
      </div>
    </div>
  );
}
