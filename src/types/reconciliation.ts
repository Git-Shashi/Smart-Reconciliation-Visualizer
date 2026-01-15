// Financial record structure for GST-based reconciliation
export interface FinancialRecord {
  id: string;
  gstin: string;
  partyName: string;
  invoiceNo: string;
  invoiceDate: string;
  taxableAmount: number;
  igst: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  // Original row data for reference
  rawData: Record<string, string | number>;
}

export type ReconciliationStatus = 
  | "matched" 
  | "mismatched" 
  | "missing_in_purchase" 
  | "missing_in_sales";

export interface MismatchReason {
  field: string;
  purchaseValue: string | number;
  salesValue: string | number;
  difference?: number;
}

export interface ReconciliationResult {
  id: string;
  status: ReconciliationStatus;
  purchaseRecord: FinancialRecord | null;
  salesRecord: FinancialRecord | null;
  matchKey: string;
  mismatchReasons: MismatchReason[];
  totalDifference: number;
}

export interface ReconciliationSummary {
  totalRecords: number;
  matchedCount: number;
  mismatchedCount: number;
  missingInPurchaseCount: number;
  missingInSalesCount: number;
  matchPercentage: number;
  totalDifferenceAmount: number;
}

export interface DatasetInfo {
  fileName: string;
  recordCount: number;
  columns: string[];
  uploadedAt: Date;
}

export type DatasetType = "purchase" | "sales";

// Column mapping configuration
export interface ColumnMapping {
  gstin: string;
  partyName: string;
  invoiceNo: string;
  invoiceDate: string;
  taxableAmount: string;
  igst: string;
  cgst: string;
  sgst: string;
  totalAmount: string;
}

// Default column mappings for common GST formats
export const DEFAULT_COLUMN_MAPPINGS: ColumnMapping = {
  gstin: "GSTIN",
  partyName: "Party Name",
  invoiceNo: "Invoice No",
  invoiceDate: "Invoice Date",
  taxableAmount: "Taxable Amount",
  igst: "IGST",
  cgst: "CGST",
  sgst: "SGST",
  totalAmount: "Total Amount",
};

// Alternative column names that may be used
export const COLUMN_ALIASES: Record<keyof ColumnMapping, string[]> = {
  gstin: ["GSTIN", "GST No", "GST Number", "Supplier GSTIN", "Customer GSTIN", "GSTIN/UIN"],
  partyName: ["Party Name", "Supplier Name", "Customer Name", "Name", "Vendor Name", "Business Name"],
  invoiceNo: ["Invoice No", "Invoice Number", "Inv No", "Bill No", "Document No", "Voucher No"],
  invoiceDate: ["Invoice Date", "Date", "Bill Date", "Document Date", "Voucher Date"],
  taxableAmount: ["Taxable Amount", "Taxable Value", "Base Amount", "Net Amount", "Amount"],
  igst: ["IGST", "IGST Amount", "Integrated Tax"],
  cgst: ["CGST", "CGST Amount", "Central Tax"],
  sgst: ["SGST", "SGST Amount", "State Tax", "UTGST"],
  totalAmount: ["Total Amount", "Total", "Invoice Value", "Gross Amount", "Invoice Amount"],
};
