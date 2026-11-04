import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Table as TanstackTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// BOLDkit Data Table. The registry copy uses Radix for row selection, column
// visibility and the page-size select. This project uses Base UI (ADR-002),
// so those two features are left out and the page size uses NativeSelect.
// KSP-77: ticket filters sit in the list page, not in this generic toolbar.

interface DataTableContextValue<TData> {
  table: TanstackTable<TData>
}

const DataTableContext = React.createContext<DataTableContextValue<unknown> | null>(
  null,
)

function useDataTable<TData>() {
  const context = React.useContext(DataTableContext)
  if (!context) {
    throw new Error("DataTable components must be used within a <DataTable />")
  }
  return context as DataTableContextValue<TData>
}

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: import("@tanstack/react-table").Column<TData, TValue>
  title: string
}

function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 data-[state=open]:bg-accent", className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>
  filterPlaceholder?: string
  filterColumn?: string
}

function DataTableToolbar<TData>({
  table,
  filterPlaceholder = "Filter...",
  filterColumn,
}: DataTableToolbarProps<TData>) {
  const column = filterColumn ? table.getColumn(filterColumn) : null
  if (!column) return null

  return (
    <div className="flex items-center py-4">
      <div className="relative w-full max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={filterPlaceholder}
          value={String(column.getFilterValue() ?? "")}
          onChange={(event) => column.setFilterValue(event.target.value)}
          className="h-9 pl-9"
        />
      </div>
    </div>
  )
}

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>
  pageSizeOptions?: number[]
}

function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor="data-table-page-size" className="text-sm font-medium">
          Rows per page
        </label>
        <NativeSelect
          id="data-table-page-size"
          value={`${table.getState().pagination.pageSize}`}
          onChange={(event) => table.setPageSize(Number(event.target.value))}
          className="w-[5.5rem]"
        >
          {pageSizeOptions.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </NativeSelect>
      </div>
      <p className="text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  enableSorting?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  filterColumn?: string
  filterPlaceholder?: string
  emptyMessage?: string
  isLoading?: boolean
}

function DataTable<TData, TValue>({
  columns,
  data,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 50],
  filterColumn,
  filterPlaceholder = "Filter...",
  emptyMessage = "No results.",
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  // TanStack Table returns functions React Compiler cannot memoize.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(enablePagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(enableSorting && { getSortedRowModel: getSortedRowModel() }),
    ...(enableFiltering && { getFilteredRowModel: getFilteredRowModel() }),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  const contextValue = React.useMemo(
    () => ({ table: table as TanstackTable<unknown> }),
    [table],
  )

  return (
    <DataTableContext.Provider value={contextValue}>
      <div className="space-y-4">
        {enableFiltering && (
          <DataTableToolbar
            table={table}
            filterPlaceholder={filterPlaceholder}
            filterColumn={filterColumn}
          />
        )}
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin border-3 border-foreground border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {enablePagination && (
          <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
        )}
      </div>
    </DataTableContext.Provider>
  )
}

export { DataTable, DataTableColumnHeader, DataTableToolbar, DataTablePagination, useDataTable }
