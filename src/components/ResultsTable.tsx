"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
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
import { Badge } from "@/components/ui/badge";
import { ReconciliationResult, ReconciliationStatus } from "@/types/reconciliation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getStatusLabel, getStatusColor } from "@/lib/reconciliation";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
} from "lucide-react";

interface ResultsTableProps {
  data: ReconciliationResult[];
}

export function ResultsTable({ data }: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const columns: ColumnDef<ReconciliationResult>[] = [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => {
        const hasDetails =
          row.original.mismatchReasons.length > 0 ||
          row.original.status !== "matched";
        return hasDetails ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleRow(row.original.id)}
          >
            {expandedRows.has(row.original.id) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        ) : null;
      },
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as ReconciliationStatus;
        return (
          <Badge variant={getStatusColor(status)}>{getStatusLabel(status)}</Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "invoiceNo",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Invoice No
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      accessorFn: (row) =>
        row.purchaseRecord?.invoiceNo || row.salesRecord?.invoiceNo || "",
    },
    {
      id: "invoiceDate",
      header: "Invoice Date",
      accessorFn: (row) =>
        row.purchaseRecord?.invoiceDate || row.salesRecord?.invoiceDate || "",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return value ? formatDate(value) : "-";
      },
    },
    {
      id: "partyName",
      header: "Party Name",
      accessorFn: (row) =>
        row.purchaseRecord?.partyName || row.salesRecord?.partyName || "",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="max-w-[200px] truncate" title={value}>
            {value || "-"}
          </span>
        );
      },
    },
    {
      id: "gstin",
      header: "GSTIN",
      accessorFn: (row) =>
        row.purchaseRecord?.gstin || row.salesRecord?.gstin || "",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return (
          <span className="font-mono text-xs">{value || "-"}</span>
        );
      },
    },
    {
      id: "purchaseAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Purchase Amount
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      accessorFn: (row) => row.purchaseRecord?.totalAmount ?? null,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value !== null ? (
          <span className="font-medium">{formatCurrency(value)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      id: "salesAmount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="-ml-4"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sales Amount
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      accessorFn: (row) => row.salesRecord?.totalAmount ?? null,
      cell: ({ getValue }) => {
        const value = getValue() as number | null;
        return value !== null ? (
          <span className="font-medium">{formatCurrency(value)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
    {
      accessorKey: "totalDifference",
      header: "Difference",
      cell: ({ row }) => {
        const diff = row.getValue("totalDifference") as number;
        if (diff === 0) return <span className="text-green-600">-</span>;
        const isPositive = diff > 0;
        return (
          <span className={isPositive ? "text-red-600" : "text-orange-600"}>
            {isPositive ? "+" : ""}
            {formatCurrency(diff)}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
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
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={
                      row.original.status === "mismatched"
                        ? "bg-red-50/50"
                        : row.original.status === "matched"
                        ? "bg-green-50/50"
                        : "bg-yellow-50/50"
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandedRows.has(row.original.id) && (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={columns.length} className="bg-gray-50 p-4">
                        <ExpandedDetails result={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ExpandedDetails({ result }: { result: ReconciliationResult }) {
  if (result.status === "matched") {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Info className="h-4 w-4" />
        <span>All fields match perfectly between purchase and sales records.</span>
      </div>
    );
  }

  if (result.status === "missing_in_purchase") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-orange-600">
          <Info className="h-4 w-4" />
          <span>This record exists in Sales Register but is missing from Purchase Register.</span>
        </div>
        {result.salesRecord && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-white p-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-gray-500">Taxable Amount</p>
              <p className="font-medium">{formatCurrency(result.salesRecord.taxableAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500">IGST</p>
              <p className="font-medium">{formatCurrency(result.salesRecord.igst)}</p>
            </div>
            <div>
              <p className="text-gray-500">CGST</p>
              <p className="font-medium">{formatCurrency(result.salesRecord.cgst)}</p>
            </div>
            <div>
              <p className="text-gray-500">SGST</p>
              <p className="font-medium">{formatCurrency(result.salesRecord.sgst)}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (result.status === "missing_in_sales") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-yellow-600">
          <Info className="h-4 w-4" />
          <span>This record exists in Purchase Register but is missing from Sales Register.</span>
        </div>
        {result.purchaseRecord && (
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-white p-4 text-sm md:grid-cols-4">
            <div>
              <p className="text-gray-500">Taxable Amount</p>
              <p className="font-medium">{formatCurrency(result.purchaseRecord.taxableAmount)}</p>
            </div>
            <div>
              <p className="text-gray-500">IGST</p>
              <p className="font-medium">{formatCurrency(result.purchaseRecord.igst)}</p>
            </div>
            <div>
              <p className="text-gray-500">CGST</p>
              <p className="font-medium">{formatCurrency(result.purchaseRecord.cgst)}</p>
            </div>
            <div>
              <p className="text-gray-500">SGST</p>
              <p className="font-medium">{formatCurrency(result.purchaseRecord.sgst)}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mismatched
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-red-600">
        <Info className="h-4 w-4" />
        <span>The following fields have discrepancies:</span>
      </div>
      <div className="rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left font-medium text-gray-600">Field</th>
              <th className="p-2 text-left font-medium text-gray-600">Purchase Value</th>
              <th className="p-2 text-left font-medium text-gray-600">Sales Value</th>
              <th className="p-2 text-left font-medium text-gray-600">Difference</th>
            </tr>
          </thead>
          <tbody>
            {result.mismatchReasons.map((reason, index) => (
              <tr key={index} className="border-b last:border-0">
                <td className="p-2 font-medium">{reason.field}</td>
                <td className="p-2">
                  {typeof reason.purchaseValue === "number"
                    ? formatCurrency(reason.purchaseValue)
                    : reason.purchaseValue}
                </td>
                <td className="p-2">
                  {typeof reason.salesValue === "number"
                    ? formatCurrency(reason.salesValue)
                    : reason.salesValue}
                </td>
                <td className="p-2 text-red-600">
                  {reason.difference !== undefined
                    ? (reason.difference > 0 ? "+" : "") + formatCurrency(reason.difference)
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
