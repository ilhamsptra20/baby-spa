import { type ReactNode } from "react";

import { ScrollArea } from "@/ui/components/common";
import { cn } from "@/ui/utils/cn";

export interface TableColumn<TData> {
  key: keyof TData;
  header: string;
  className?: string;
  headerClassName?: string;
  render?: (row: TData, rowIndex: number) => ReactNode;
}

interface TableProps<TData extends object> {
  columns: TableColumn<TData>[];
  data: TData[];
  rowKey: keyof TData | ((row: TData, rowIndex: number) => string);
  emptyState?: ReactNode;
  className?: string;
}

export function Table<TData extends object>({
  columns,
  data,
  rowKey,
  emptyState,
  className,
}: TableProps<TData>) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm", className)}>
      <ScrollArea orientation="horizontal" className="max-w-full" fadeEdges hideScrollbarUntilHover>
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  {emptyState ?? <p className="text-sm text-slate-500 dark:text-slate-400">No records found.</p>}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => {
                const keyValue =
                  typeof rowKey === "function"
                    ? rowKey(row, rowIndex)
                    : String(row[rowKey] ?? rowIndex);

                return (
                  <tr key={keyValue} className="transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/70 dark:bg-slate-900/80">
                    {columns.map((column) => {
                      const cellValue = row[column.key];

                      return (
                        <td
                          key={String(column.key)}
                          className={cn("whitespace-nowrap px-4 py-3 text-sm text-slate-700 dark:text-slate-200", column.className)}
                        >
                          {column.render ? column.render(row, rowIndex) : String(cellValue ?? "-")}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}
