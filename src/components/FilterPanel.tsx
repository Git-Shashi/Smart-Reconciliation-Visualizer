"use client";

import { useState } from "react";
import { Search, Filter, X, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ReconciliationResult, ReconciliationStatus } from "@/types/reconciliation";

interface FilterPanelProps {
  results: ReconciliationResult[];
  onFilteredResults: (results: ReconciliationResult[]) => void;
  onExport: () => void;
}

type StatusFilter = ReconciliationStatus | "all";

export function FilterPanel({ results, onFilteredResults, onExport }: FilterPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const applyFilters = () => {
    let filtered = [...results];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((result) => {
        const invoiceNo = (
          result.purchaseRecord?.invoiceNo ||
          result.salesRecord?.invoiceNo ||
          ""
        ).toLowerCase();
        const partyName = (
          result.purchaseRecord?.partyName ||
          result.salesRecord?.partyName ||
          ""
        ).toLowerCase();
        const gstin = (
          result.purchaseRecord?.gstin ||
          result.salesRecord?.gstin ||
          ""
        ).toLowerCase();

        return (
          invoiceNo.includes(query) ||
          partyName.includes(query) ||
          gstin.includes(query)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((result) => result.status === statusFilter);
    }

    // Amount range filter
    const min = parseFloat(minAmount) || 0;
    const max = parseFloat(maxAmount) || Infinity;

    if (minAmount || maxAmount) {
      filtered = filtered.filter((result) => {
        const amount =
          result.purchaseRecord?.totalAmount ||
          result.salesRecord?.totalAmount ||
          0;
        return amount >= min && amount <= max;
      });
    }

    onFilteredResults(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setMinAmount("");
    setMaxAmount("");
    onFilteredResults(results);
  };

  const hasActiveFilters =
    searchQuery || statusFilter !== "all" || minAmount || maxAmount;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "matched", label: "Matched" },
    { value: "mismatched", label: "Mismatched" },
    { value: "missing_in_purchase", label: "Missing in Purchase" },
    { value: "missing_in_sales", label: "Missing in Sales" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by Invoice No, Party Name, or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[180px]">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          />
        </div>

        {/* Amount Range */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min Amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-[120px]"
          />
          <span className="text-gray-400">-</span>
          <Input
            type="number"
            placeholder="Max Amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="w-[120px]"
          />
        </div>

        {/* Action Buttons */}
        <Button onClick={applyFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Apply Filters
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}

        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => {
                  setSearchQuery("");
                  applyFilters();
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {statusFilter !== "all" && (
            <Badge variant="secondary">
              Status: {statusOptions.find((o) => o.value === statusFilter)?.label}
              <button
                onClick={() => {
                  setStatusFilter("all");
                  applyFilters();
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(minAmount || maxAmount) && (
            <Badge variant="secondary">
              Amount: ₹{minAmount || "0"} - ₹{maxAmount || "∞"}
              <button
                onClick={() => {
                  setMinAmount("");
                  setMaxAmount("");
                  applyFilters();
                }}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Export results to CSV
 */
export function exportToCSV(results: ReconciliationResult[], filename: string = "reconciliation-report.csv") {
  const headers = [
    "Status",
    "Invoice No",
    "Invoice Date",
    "Party Name",
    "GSTIN",
    "Purchase Taxable Amount",
    "Purchase IGST",
    "Purchase CGST",
    "Purchase SGST",
    "Purchase Total",
    "Sales Taxable Amount",
    "Sales IGST",
    "Sales CGST",
    "Sales SGST",
    "Sales Total",
    "Difference",
    "Mismatch Reasons",
  ];

  const rows = results.map((result) => {
    const purchase = result.purchaseRecord;
    const sales = result.salesRecord;
    const reasons = result.mismatchReasons
      .map((r) => `${r.field}: ${r.purchaseValue} vs ${r.salesValue}`)
      .join("; ");

    return [
      result.status,
      purchase?.invoiceNo || sales?.invoiceNo || "",
      purchase?.invoiceDate || sales?.invoiceDate || "",
      purchase?.partyName || sales?.partyName || "",
      purchase?.gstin || sales?.gstin || "",
      purchase?.taxableAmount || "",
      purchase?.igst || "",
      purchase?.cgst || "",
      purchase?.sgst || "",
      purchase?.totalAmount || "",
      sales?.taxableAmount || "",
      sales?.igst || "",
      sales?.cgst || "",
      sales?.sgst || "",
      sales?.totalAmount || "",
      result.totalDifference,
      reasons,
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell);
          // Escape quotes and wrap in quotes if contains comma or quote
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
