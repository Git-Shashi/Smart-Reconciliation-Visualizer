"use client";

import React, { useCallback, useState } from "react";
import Papa from "papaparse";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DatasetType, FinancialRecord, COLUMN_ALIASES, ColumnMapping } from "@/types/reconciliation";
import { parseNumber } from "@/lib/utils";

interface FileUploadProps {
  datasetType: DatasetType;
  onDataLoaded: (records: FinancialRecord[], fileName: string, columns: string[]) => void;
  isLoaded: boolean;
  fileName?: string;
  recordCount?: number;
}

// Find matching column from CSV headers
function findColumn(headers: string[], aliases: string[]): string | null {
  const normalizedAliases = aliases.map((a) => a.toLowerCase().trim());
  for (const header of headers) {
    if (normalizedAliases.includes(header.toLowerCase().trim())) {
      return header;
    }
  }
  return null;
}

// Auto-detect column mappings from CSV headers
function detectColumnMappings(headers: string[]): Partial<ColumnMapping> {
  const mappings: Partial<ColumnMapping> = {};
  
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    const matchedColumn = findColumn(headers, aliases);
    if (matchedColumn) {
      mappings[field as keyof ColumnMapping] = matchedColumn;
    }
  }
  
  return mappings;
}

// Parse CSV row to FinancialRecord
function parseRow(
  row: Record<string, string>,
  index: number,
  mappings: Partial<ColumnMapping>
): FinancialRecord {
  const getValue = (field: keyof ColumnMapping, defaultValue: string = ""): string => {
    const column = mappings[field];
    return column ? (row[column] || defaultValue) : defaultValue;
  };

  const getNumericValue = (field: keyof ColumnMapping): number => {
    const value = getValue(field, "0");
    return parseNumber(value);
  };

  const taxableAmount = getNumericValue("taxableAmount");
  const igst = getNumericValue("igst");
  const cgst = getNumericValue("cgst");
  const sgst = getNumericValue("sgst");
  let totalAmount = getNumericValue("totalAmount");

  // If total is not provided, calculate it
  if (totalAmount === 0 && taxableAmount > 0) {
    totalAmount = taxableAmount + igst + cgst + sgst;
  }

  return {
    id: `row-${index}`,
    gstin: getValue("gstin"),
    partyName: getValue("partyName"),
    invoiceNo: getValue("invoiceNo"),
    invoiceDate: getValue("invoiceDate"),
    taxableAmount,
    igst,
    cgst,
    sgst,
    totalAmount,
    rawData: row,
  };
}

export function FileUpload({
  datasetType,
  onDataLoaded,
  isLoaded,
  fileName,
  recordCount,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setIsProcessing(true);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const data = results.data as Record<string, string>[];
            
            if (data.length === 0) {
              setError("The file appears to be empty");
              setIsProcessing(false);
              return;
            }

            const headers = Object.keys(data[0]);
            const mappings = detectColumnMappings(headers);

            // Check if we have the minimum required columns
            if (!mappings.invoiceNo) {
              setError("Could not find Invoice Number column. Please ensure your CSV has an 'Invoice No' or similar column.");
              setIsProcessing(false);
              return;
            }

            const records = data
              .map((row, index) => parseRow(row, index, mappings))
              .filter((record) => record.invoiceNo); // Filter out rows without invoice numbers

            onDataLoaded(records, file.name, headers);
            setIsProcessing(false);
          } catch (err) {
            setError(`Error processing file: ${err instanceof Error ? err.message : "Unknown error"}`);
            setIsProcessing(false);
          }
        },
        error: (err) => {
          setError(`Error reading file: ${err.message}`);
          setIsProcessing(false);
        },
      });
    },
    [onDataLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === "text/csv" || file.name.endsWith(".csv")) {
          processFile(file);
        } else {
          setError("Please upload a CSV file");
        }
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile]
  );

  const title = datasetType === "purchase" ? "Purchase Register" : "Sales Register";
  const description =
    datasetType === "purchase"
      ? "Upload your purchase/GSTR-2A data"
      : "Upload your sales/GSTR-1 data";

  return (
    <Card className={cn("transition-all", isLoaded && "border-green-300 bg-green-50/30")}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileSpreadsheet className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoaded ? (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{fileName}</p>
                <p className="text-sm text-green-600">{recordCount} records loaded</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDataLoaded([], "", [])}
              className="text-green-700 hover:bg-green-100 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400",
                isProcessing && "pointer-events-none opacity-50"
              )}
            >
              <Upload
                className={cn(
                  "mb-3 h-10 w-10",
                  isDragging ? "text-blue-500" : "text-gray-400"
                )}
              />
              <p className="mb-1 text-sm font-medium text-gray-700">
                {isProcessing ? "Processing..." : "Drop your CSV file here"}
              </p>
              <p className="mb-3 text-xs text-gray-500">or click to browse</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id={`file-upload-${datasetType}`}
                disabled={isProcessing}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-upload-${datasetType}`)?.click()}
                disabled={isProcessing}
              >
                Select File
              </Button>
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
