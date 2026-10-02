import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  render: (row: T) => ReactNode;
  rowHeader?: boolean;
  sortKey?: string;
};

export type DataTablePagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function DataTable<T extends { id: string }>({
  caption,
  columns,
  rows,
  sortBy,
  order = "asc",
  onSort,
  pagination,
}: {
  caption: string;
  columns: readonly DataTableColumn<T>[];
  rows: readonly T[];
  sortBy?: string;
  order?: "asc" | "desc";
  onSort?: (sortKey: string) => void;
  pagination?: DataTablePagination;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-[#f5f7f3] text-xs uppercase text-[#64756c]">
          <tr>
            {columns.map((column) => {
              const active = column.sortKey === sortBy;
              return (
                <th
                  aria-sort={
                    column.sortKey && active
                      ? order === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className="px-5 py-3 font-semibold"
                  key={column.id}
                  scope="col"
                >
                  {column.sortKey && onSort ? (
                    <button
                      aria-label={`Sort by ${column.header}`}
                      className="inline-flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
                      onClick={() => onSort(column.sortKey as string)}
                      type="button"
                    >
                      {column.header}
                      {active ? (
                        order === "asc" ? (
                          <ArrowUp aria-hidden="true" size={14} />
                        ) : (
                          <ArrowDown aria-hidden="true" size={14} />
                        )
                      ) : (
                        <ArrowUpDown aria-hidden="true" size={14} />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e4e9e4]">
          {rows.length === 0 ? (
            <tr>
              <td
                className="px-5 py-10 text-center text-sm text-[#64756c]"
                colSpan={columns.length}
              >
                No records found.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr className="hover:bg-[#f8faf7]" key={row.id}>
                {columns.map((column) =>
                  column.rowHeader ? (
                    <th
                      className="px-5 py-4 text-left font-medium"
                      key={column.id}
                      scope="row"
                    >
                      {column.render(row)}
                    </th>
                  ) : (
                    <td className="px-5 py-4" key={column.id}>
                      {column.render(row)}
                    </td>
                  ),
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {pagination && pagination.total > 0 && (
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e9e4] px-4 py-3 text-sm text-[#53665d] sm:px-5">
          <p>
            {pagination.total} records · page {pagination.page} of{" "}
            {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="h-9 rounded-md border border-[#cbd4ce] px-3 hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-[#346e58] disabled:opacity-45"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              type="button"
            >
              Previous
            </button>
            <button
              className="h-9 rounded-md border border-[#cbd4ce] px-3 hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-[#346e58] disabled:opacity-45"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
