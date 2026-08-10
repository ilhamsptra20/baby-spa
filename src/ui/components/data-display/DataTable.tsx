"use client";

import {
  ArrowsUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { type ReactNode, useMemo, useState } from "react";

import { ScrollArea } from "@/ui/components/common";
import { FilterDropdown } from "@/ui/components/data-display/FilterDropdown";
import { EmptyState, Spinner } from "@/ui/components/feedback";
import { cn } from "@/ui/utils/cn";

type SortDirection = "asc" | "desc";

type SortableValue = string | number | boolean | Date | null | undefined;
type PageToken = number | "ellipsis";

export interface DataTableColumn<TData extends object> {
  key: keyof TData | string;
  header: ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  render?: (row: TData, rowIndex: number) => ReactNode;
  sortAccessor?: (row: TData) => SortableValue;
}

export interface DataTableFilter<TData extends object> {
  key: keyof TData | string;
  label: string;
  options: {
    label: string;
    value: string;
    disabled?: boolean;
  }[];
  multiple?: boolean;
  predicate?: (row: TData, selectedValues: string[]) => boolean;
}

interface DataTableProps<TData extends object> {
  data: TData[];
  columns: DataTableColumn<TData>[];
  getRowId?: (row: TData, rowIndex: number) => string;
  loading?: boolean;
  emptyState?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof TData)[];
  searchPredicate?: (row: TData, query: string) => boolean;
  filters?: DataTableFilter<TData>[];
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showRowNumber?: boolean;
  rowNumberHeader?: ReactNode;
  rowActions?: (row: TData, rowIndex: number) => ReactNode;
  actionHeader?: ReactNode;
  className?: string;
}

function normalizeSortValue(value: SortableValue) {
  if (value instanceof Date) {
    return value.getTime();
  }

  return value;
}

function buildPageTokens(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: PageToken[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    tokens.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis");
  }

  tokens.push(totalPages);

  return tokens;
}

export function DataTable<TData extends object>({
  data,
  columns,
  getRowId,
  loading = false,
  emptyState,
  searchable = false,
  searchPlaceholder = "Search data...",
  searchKeys,
  searchPredicate,
  filters = [],
  sortable = true,
  paginated = false,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50],
  showRowNumber = false,
  rowNumberHeader = "No.",
  rowActions,
  actionHeader = "Actions",
  className,
}: DataTableProps<TData>) {
  const [query, setQuery] = useState("");
  const [sortState, setSortState] = useState<{
    key: string | null;
    direction: SortDirection;
  }>({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});

  const normalizedQuery = query.trim().toLowerCase();
  const hasFilters = filters.length > 0;

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = (() => {
        if (!searchable || !normalizedQuery) {
          return true;
        }

        if (searchPredicate) {
          return searchPredicate(row, normalizedQuery);
        }

        const rowEntries =
          searchKeys && searchKeys.length > 0
            ? searchKeys.map((key) => row[key])
            : (Object.values(row) as unknown[]);

        return rowEntries.some((value) => String(value ?? "").toLowerCase().includes(normalizedQuery));
      })();

      if (!matchesSearch) {
        return false;
      }

      return filters.every((filter) => {
        const filterKey = String(filter.key);
        const selectedValues = filterValues[filterKey] ?? [];

        if (selectedValues.length === 0) {
          return true;
        }

        if (filter.predicate) {
          return filter.predicate(row, selectedValues);
        }

        const rowValue = (row as Record<string, unknown>)[filterKey];
        return selectedValues.includes(String(rowValue ?? ""));
      });
    });
  }, [data, filterValues, filters, normalizedQuery, searchable, searchKeys, searchPredicate]);

  const sortedData = useMemo(() => {
    if (!sortable || !sortState.key) {
      return filteredData;
    }

    const targetColumn = columns.find((column) => String(column.key) === sortState.key);
    if (!targetColumn) {
      return filteredData;
    }

    const sorted = [...filteredData].sort((a, b) => {
      const left = normalizeSortValue(
        targetColumn.sortAccessor
          ? targetColumn.sortAccessor(a)
          : (a as Record<string, unknown>)[String(targetColumn.key)] as SortableValue,
      );
      const right = normalizeSortValue(
        targetColumn.sortAccessor
          ? targetColumn.sortAccessor(b)
          : (b as Record<string, unknown>)[String(targetColumn.key)] as SortableValue,
      );

      if (left === right) {
        return 0;
      }

      if (left === null || left === undefined) {
        return 1;
      }

      if (right === null || right === undefined) {
        return -1;
      }

      if (typeof left === "number" && typeof right === "number") {
        return left - right;
      }

      return String(left).localeCompare(String(right), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    if (sortState.direction === "desc") {
      sorted.reverse();
    }

    return sorted;
  }, [columns, filteredData, sortState, sortable]);

  const totalRows = sortedData.length;
  const totalPages = paginated ? Math.max(1, Math.ceil(totalRows / rowsPerPage)) : 1;
  const effectivePage = paginated ? Math.min(currentPage, totalPages) : 1;
  const pageTokens = buildPageTokens(effectivePage, totalPages);

  const visibleData = useMemo(() => {
    if (!paginated) {
      return sortedData;
    }

    const start = (effectivePage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, paginated, effectivePage, rowsPerPage]);

  const startRow = paginated && totalRows > 0 ? (effectivePage - 1) * rowsPerPage + 1 : 1;
  const endRow = paginated && totalRows > 0 ? Math.min(totalRows, effectivePage * rowsPerPage) : totalRows;

  function handleSort(column: DataTableColumn<TData>) {
    if (!sortable || !column.sortable) {
      return;
    }

    const nextKey = String(column.key);

    setSortState((prev) => {
      if (prev.key === nextKey) {
        return {
          key: nextKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: nextKey,
        direction: "asc",
      };
    });
  }

  function handleSearchChange(nextQuery: string) {
    setQuery(nextQuery);
    setCurrentPage(1);
  }

  function handleRowsPerPageChange(nextRowsPerPage: number) {
    setRowsPerPage(nextRowsPerPage);
    setCurrentPage(1);
  }

  function handleFilterChange(filterKey: string, nextValues: string[]) {
    setFilterValues((current) => ({
      ...current,
      [filterKey]: nextValues,
    }));
    setCurrentPage(1);
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm transition-shadow duration-200 hover:shadow",
        className,
      )}
    >
      {(searchable || paginated || hasFilters) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            {searchable ? (
              <label className="relative block w-full sm:max-w-sm">
                <MagnifyingGlassIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-10 w-full rounded-md border border-slate-300 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm text-slate-800 dark:text-slate-200 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                />
              </label>
            ) : null}

            {filters.map((filter) => {
              const filterKey = String(filter.key);

              return (
                <FilterDropdown
                  key={filterKey}
                  label={filter.label}
                  options={filter.options}
                  selectedValues={filterValues[filterKey] ?? []}
                  onChange={(values) => handleFilterChange(filterKey, values)}
                  multiple={filter.multiple}
                />
              );
            })}
          </div>

          {paginated ? (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300" htmlFor="table-page-size">
                Rows
              </label>
              <select
                id="table-page-size"
                value={rowsPerPage}
                onChange={(event) => handleRowsPerPageChange(Number(event.target.value))}
                className="h-9 rounded-md border border-slate-300 bg-white dark:bg-slate-900 px-2 text-sm text-slate-700 dark:text-slate-200 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      )}

      <ScrollArea orientation="horizontal" className="max-w-full" hideScrollbarUntilHover>
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              {showRowNumber ? (
                <th className="w-16 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {rowNumberHeader}
                </th>
              ) : null}

              {columns.map((column) => {
                const isColumnSortable = sortable && Boolean(column.sortable);
                const isCurrentSort = sortState.key === String(column.key);

                return (
                  <th
                    key={String(column.key)}
                    scope="col"
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
                      column.headerClassName,
                    )}
                  >
                    {isColumnSortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className="inline-flex items-center gap-1 text-left text-inherit transition hover:text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                      >
                        <span>{column.header}</span>
                        <ArrowsUpDownIcon
                          className={cn(
                            "h-4 w-4",
                            isCurrentSort ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500",
                          )}
                          aria-hidden="true"
                        />
                        {isCurrentSort ? (
                          <span className="sr-only">Sorted {sortState.direction}</span>
                        ) : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}

              {rowActions ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {actionHeader}
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + Number(showRowNumber) + Number(Boolean(rowActions))}
                  className="px-4 py-10"
                >
                  <div className="flex items-center justify-center">
                    <Spinner label="Loading table data..." />
                  </div>
                </td>
              </tr>
            ) : visibleData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + Number(showRowNumber) + Number(Boolean(rowActions))}
                  className="px-4 py-10"
                >
                  {emptyState ?? (
                    <EmptyState
                      title="No matching data"
                      description="Try adjusting filters or search keywords."
                      className="border-none bg-slate-50 dark:bg-slate-900/60"
                    />
                  )}
                </td>
              </tr>
            ) : (
              visibleData.map((row, rowIndex) => {
                const absoluteIndex = paginated ? (effectivePage - 1) * rowsPerPage + rowIndex : rowIndex;
                const rowId =
                  getRowId?.(row, absoluteIndex) ??
                  String((row as Record<string, unknown>).id ?? absoluteIndex);

                return (
                  <tr key={rowId} className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/70 dark:bg-slate-900/80">
                    {showRowNumber ? (
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{absoluteIndex + 1}</td>
                    ) : null}

                    {columns.map((column) => {
                      const fallbackValue = (row as Record<string, unknown>)[String(column.key)];

                      return (
                        <td
                          key={String(column.key)}
                          className={cn(
                            "whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-200",
                            column.className,
                          )}
                        >
                          {column.render ? column.render(row, absoluteIndex) : String(fallbackValue ?? "-")}
                        </td>
                      );
                    })}

                    {rowActions ? (
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {rowActions(row, absoluteIndex)}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollArea>

      {paginated && !loading && totalRows > 0 ? (
        <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600 dark:text-slate-300">
            Showing <span className="font-medium text-slate-800 dark:text-slate-200">{startRow}</span> -{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">{endRow}</span> of{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">{totalRows}</span>
          </p>

          <nav className="flex flex-wrap items-center gap-1 self-end sm:self-auto" aria-label="Table pagination">
            <button
              type="button"
              onClick={() => setCurrentPage(Math.max(1, effectivePage - 1))}
              disabled={effectivePage === 1}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Previous page"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              <span>Previous</span>
            </button>

            {pageTokens.map((token, index) => {
              if (token === "ellipsis") {
                return (
                  <span key={`ellipsis-${index}`} className="px-1 text-sm text-slate-400 dark:text-slate-500" aria-hidden="true">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={token}
                  type="button"
                  onClick={() => setCurrentPage(token)}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
                    effectivePage === token
                      ? "border-transparent bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
                  )}
                  aria-current={effectivePage === token ? "page" : undefined}
                >
                  {token}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setCurrentPage(Math.min(totalPages, effectivePage + 1))}
              disabled={effectivePage === totalPages}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
